const OTP = require('../models/otp');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET || 'jurismax_super_secret_key_12345';

// Optional: Msg91 integration helper
const sendOtpMsg91 = async (phoneNumber, otp) => {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  if (!authKey || !templateId) {
    console.log(`[SMS MOCK] MSG91 config missing. OTP for ${phoneNumber} is: ${otp}`);
    return { success: true, mocked: true };
  }

  const options = {
    method: 'POST',
    url: 'https://control.msg91.com/api/v5/otp',
    params: {
      authkey: authKey,
      template_id: templateId,
      mobile: phoneNumber,
      otp_expiry: '5',
    },
    headers: {
      'Content-Type': 'application/json',
    },
    data: { OTP: otp },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Msg91 Send Error:', error.response?.data || error.message);
    throw new Error('Failed to send SMS via Msg91');
  }
};

// Send OTP
exports.sendOTP = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  // Simple validation for phone numbers (e.g. +91XXXXXXXXXX or standard length)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  try {
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Upsert the OTP in database
    await OTP.findOneAndUpdate(
      { phoneNumber },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Attempt to send
    await sendOtpMsg91(phoneNumber, otp);

    res.json({
      success: true,
      message: 'OTP processed successfully. Check console (mock) or SMS if Msg91 is configured.'
    });
  } catch (error) {
    console.error('Error in sendOTP:', error);
    res.status(500).json({ error: 'Failed to send OTP', message: error.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ error: 'Phone number and OTP are required' });
  }

  try {
    let isValid = false;

    // 1. Development Bypass / Universal Test Code: "123456"
    if (otp === '123456') {
      console.log(`[AUTH BYPASS] Universal OTP verified for phone: ${phoneNumber}`);
      isValid = true;
    } else {
      // 2. Standard DB Lookup
      const record = await OTP.findOne({ phoneNumber }).sort({ createdAt: -1 });

      if (record) {
        if (new Date() > record.expiresAt) {
          await OTP.deleteOne({ _id: record._id });
          return res.status(400).json({ error: 'OTP has expired' });
        }

        if (record.otp === otp) {
          isValid = true;
          await OTP.deleteOne({ _id: record._id }); // Single-use
        }
      }
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid OTP code' });
    }

    // Check user registration state
    const user = await User.findOne({ phone: phoneNumber });
    const isRegistered = !!(user && user.isRegistered);

    const payload = user
      ? {
          userId: user._id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          role: user.role
        }
      : {
          phone: phoneNumber
        };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    // Set cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      message: isRegistered ? 'User logged in successfully' : 'OTP verified, registration required.',
      isRegistered,
      token,
      user: user || null
    });

  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP', message: error.message });
  }
};

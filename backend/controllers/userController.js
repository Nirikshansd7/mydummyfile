const User = require('../models/user');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'jurismax_super_secret_key_12345';

// Complete profile registration/update
exports.updateUserProfile = async (req, res) => {
  const phoneFromToken = req.user.phone;
  const { name, email, profilePhoto } = req.body;

  if (!phoneFromToken) {
    return res.status(401).json({ error: 'Unauthorized. Phone missing in token.' });
  }

  try {
    let user = await User.findOne({ phone: phoneFromToken });

    if (!user) {
      user = new User({ phone: phoneFromToken });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    user.isRegistered = true;

    const savedUser = await user.save();

    // Re-sign complete token
    const token = jwt.sign(
      {
        userId: savedUser._id,
        phone: savedUser.phone,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: savedUser,
      token
    });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    res.status(500).json({ error: 'Failed to update profile', message: error.message });
  }
};

// Get current logged-in user profile
exports.getUser = async (req, res) => {
  const phoneFromToken = req.user.phone;

  try {
    const user = await User.findOne({ phone: phoneFromToken });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error in getUser:', error);
    res.status(500).json({ error: 'Failed to fetch user details', message: error.message });
  }
};

// Logout User
exports.logout = (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax'
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 300 } // Auto-delete OTP documents after 5 minutes (300 seconds)
  }
}, { timestamps: true });

module.exports = mongoose.model('OTP', otpSchema);

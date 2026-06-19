import React, { useState } from 'react';
import axios from 'axios';
import { Phone, KeyRound, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

const Login = ({ onAuthSuccess, onNavigateToRegister, setTempPhone }) => {
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const API_URL = 'http://localhost:5000/api';

  // Format phone number during typing
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (!value.startsWith('+91')) {
      // Retain prefix
      return;
    }
    const numbersOnly = value.slice(3).replace(/\D/g, '').slice(0, 10);
    setPhone('+91' + numbersOnly);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (phone.length !== 13) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/otp/send-otp`, { phoneNumber: phone });
      setIsOtpSent(true);
      setInfoMessage('OTP sent! For testing, you can check backend logs or enter standard code: 123456');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (otp.length !== 6) {
      setError('OTP must be exactly 6 digits.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/otp/verify-otp`, {
        phoneNumber: phone,
        otp: otp
      });

      const { isRegistered, token, user } = response.data;

      // Save token in localStorage
      localStorage.setItem('auth_token', token);

      if (isRegistered) {
        onAuthSuccess(user, token);
      } else {
        // Redirect to register profile
        setTempPhone(phone);
        onNavigateToRegister(token);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <div className="profile-badge" style={{ margin: 0 }}>
          <ShieldCheck size={36} />
        </div>
      </div>
      
      <h1>JurisMax</h1>
      <p className="subtitle">Secure Full-Stack Login Portal</p>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="alert alert-success" style={{ fontSize: '13px', lineHeight: '1.4' }}>
          <span>{infoMessage}</span>
        </div>
      )}

      {!isOtpSent ? (
        <form onSubmit={handleSendOtp}>
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Mobile Number</label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={18} />
              <input
                id="phone"
                type="text"
                className="form-input"
                placeholder="+91XXXXXXXXXX"
                value={phone}
                onChange={handlePhoneChange}
                disabled={loading}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                Send One-Time Password
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <div className="form-group">
            <label className="form-label" htmlFor="otp">Enter 6-Digit OTP</label>
            <div className="input-wrapper">
              <KeyRound className="input-icon" size={18} />
              <input
                id="otp"
                type="text"
                maxLength={6}
                pattern="\d{6}"
                className="form-input"
                placeholder="XXXXXX"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                required
                autoFocus
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginBottom: '16px' }}>
            {loading ? <div className="spinner"></div> : 'Verify & Continue'}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setIsOtpSent(false);
              setOtp('');
              setError('');
              setInfoMessage('');
            }}
            disabled={loading}
          >
            Change Phone Number
          </button>
        </form>
      )}

      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--text-dim)' }}>
        <HelpCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
        Secure token sessions expire automatically after 7 days.
      </div>
    </div>
  );
};

export default Login;

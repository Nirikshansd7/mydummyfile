import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Sparkles, AlertCircle } from 'lucide-react';

const Register = ({ token, tempPhone, onRegisterSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/users/update-profile`,
        { name, email, profilePhoto: 'default-avatar.png' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { user, token: newToken } = response.data;
      localStorage.setItem('auth_token', newToken);
      onRegisterSuccess(user, newToken);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <div className="profile-badge" style={{ margin: 0 }}>
          <Sparkles size={36} />
        </div>
      </div>

      <h1>Create Profile</h1>
      <p className="subtitle">Let's set up your account for {tempPhone}</p>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Full Name</label>
          <div className="input-wrapper">
            <User className="input-icon" size={18} />
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={18} />
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginBottom: '16px' }}>
          {loading ? <div className="spinner"></div> : 'Complete Registration'}
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default Register;

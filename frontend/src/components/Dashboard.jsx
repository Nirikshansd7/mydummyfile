import React from 'react';
import axios from 'axios';
import { LogOut, User, Mail, Phone, Calendar, Shield } from 'lucide-react';

const Dashboard = ({ user, token, onLogout }) => {
  const API_URL = 'http://localhost:5000/api';

  const handleLogout = async () => {
    try {
      // Clear on backend
      await axios.post(`${API_URL}/users/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.warn('Backend logout failed/ignored', err);
    } finally {
      // Clear on client
      localStorage.removeItem('auth_token');
      onLogout();
    }
  };

  // Get initials for profile badge
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="auth-card" style={{ maxWidth: '520px' }}>
      <div className="profile-badge">
        {getInitials(user?.name)}
      </div>

      <h1 style={{ marginBottom: '4px' }}>Welcome, {user?.name || 'User'}!</h1>
      <p className="subtitle" style={{ marginBottom: '24px' }}>Logged in to JurisMax Dashboard</p>

      <div className="profile-info-grid">
        <div className="profile-info-row">
          <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} /> Name
          </span>
          <span className="info-value">{user?.name || 'N/A'}</span>
        </div>

        <div className="profile-info-row">
          <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={16} /> Email
          </span>
          <span className="info-value">{user?.email || 'N/A'}</span>
        </div>

        <div className="profile-info-row">
          <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={16} /> Phone
          </span>
          <span className="info-value">{user?.phone || 'N/A'}</span>
        </div>

        <div className="profile-info-row">
          <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} /> Account Status
          </span>
          <span className="info-value" style={{ color: 'var(--success)', fontWeight: '600' }}>Active (Verified)</span>
        </div>

        <div className="profile-info-row">
          <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} /> Registered On
          </span>
          <span className="info-value">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      <button onClick={handleLogout} className="btn-primary" style={{ background: 'linear-gradient(135deg, hsl(354, 70%, 54%) 0%, hsl(340, 85%, 48%) 100%)', boxShadow: '0 8px 20px -6px rgba(239, 68, 68, 0.4)' }}>
        <LogOut size={18} />
        Sign Out Securely
      </button>
    </div>
  );
};

export default Dashboard;

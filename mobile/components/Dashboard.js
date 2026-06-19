import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { LogOut, User, Mail, Phone, Calendar, Shield } from 'lucide-react-native';
import styles, { COLORS } from '../styles';
import { API_URL } from '../config';

const Dashboard = ({ user, token, onLogout }) => {

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/users/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.warn('Backend logout failed/ignored', err.message);
    } finally {
      onLogout();
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.authCard}>
      <View style={styles.profileBadge}>
        <Text style={styles.profileBadgeText}>{getInitials(user?.name)}</Text>
      </View>

      <Text style={styles.title}>Welcome, {user?.name || 'User'}!</Text>
      <Text style={styles.subtitle}>Logged in to JurisMax Dashboard</Text>

      <View style={styles.infoGrid}>
        <View style={styles.infoRow}>
          <View style={styles.infoLabelContainer}>
            <User style={styles.infoLabelIcon} size={16} />
            <Text style={styles.infoLabel}>Name</Text>
          </View>
          <Text style={styles.infoValue}>{user?.name || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLabelContainer}>
            <Mail style={styles.infoLabelIcon} size={16} />
            <Text style={styles.infoLabel}>Email</Text>
          </View>
          <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLabelContainer}>
            <Phone style={styles.infoLabelIcon} size={16} />
            <Text style={styles.infoLabel}>Phone</Text>
          </View>
          <Text style={styles.infoValue}>{user?.phone || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLabelContainer}>
            <Shield style={styles.infoLabelIcon} size={16} />
            <Text style={styles.infoLabel}>Account Status</Text>
          </View>
          <Text style={styles.infoValueActive}>Active (Verified)</Text>
        </View>

        <View style={[styles.infoRow, styles.infoRowLast]}>
          <View style={styles.infoLabelContainer}>
            <Calendar style={styles.infoLabelIcon} size={16} />
            <Text style={styles.infoLabel}>Registered On</Text>
          </View>
          <Text style={styles.infoValue}>
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.btnPrimary, { backgroundColor: '#ef4444' }]}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <LogOut size={18} color="#ffffff" style={{ marginRight: 8 }} />
        <Text style={styles.btnPrimaryText}>Sign Out Securely</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Dashboard;

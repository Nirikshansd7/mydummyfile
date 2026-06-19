import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import { User, Mail, Sparkles, AlertCircle } from 'lucide-react-native';
import styles, { COLORS } from '../styles';
import { API_URL } from '../config';

const Register = ({ token, tempPhone, onRegisterSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusName, setFocusName] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);

  const handleSubmit = async () => {
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
      onRegisterSuccess(user, newToken);
    } catch (err) {
      console.log('Update profile error details:', err.message, err.response?.data);
      setError(err.response?.data?.error || 'Failed to register profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ width: '100%' }}
    >
      <View style={styles.authCard}>
        <View style={styles.profileBadge}>
          <Sparkles size={36} color="#ffffff" />
        </View>

        <Text style={styles.title}>Create Profile</Text>
        <Text style={styles.subtitle}>Let's set up your account for {tempPhone}</Text>

        {error ? (
          <View style={[styles.alert, styles.alertError]}>
            <AlertCircle size={18} color={COLORS.error} />
            <Text style={styles.alertText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={[styles.inputWrapper, focusName && styles.inputWrapperFocus]}>
            <User
              style={[styles.inputIcon, focusName && styles.inputIconFocus]}
              size={18}
            />
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={COLORS.textDim}
              value={name}
              onChangeText={setName}
              editable={!loading}
              onFocus={() => setFocusName(true)}
              onBlur={() => setFocusName(false)}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={[styles.inputWrapper, focusEmail && styles.inputWrapperFocus]}>
            <Mail
              style={[styles.inputIcon, focusEmail && styles.inputIconFocus]}
              size={18}
            />
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="john@example.com"
              placeholderTextColor={COLORS.textDim}
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              onFocus={() => setFocusEmail(true)}
              onBlur={() => setFocusEmail(false)}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.btnPrimaryText}>Complete Registration</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={onCancel}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.btnSecondaryText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Register;

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import { Phone, KeyRound, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react-native';
import styles, { COLORS } from '../styles';
import { API_URL } from '../config';

const Login = ({ onAuthSuccess, onNavigateToRegister, setTempPhone }) => {
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [focusPhone, setFocusPhone] = useState(false);
  const [focusOtp, setFocusOtp] = useState(false);

  const handlePhoneChange = (text) => {
    if (!text.startsWith('+91')) {
      return;
    }
    const numbersOnly = text.slice(3).replace(/\D/g, '').slice(0, 10);
    setPhone('+91' + numbersOnly);
  };

  const handleSendOtp = async () => {
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
      setInfoMessage('OTP sent! Enter standard code: 123456 or check backend console logs.');
    } catch (err) {
      console.log('Send OTP error details:', err.message, err.response?.data);
      setError(err.response?.data?.error || 'Failed to send OTP. Verify backend is running and config.js IP matches.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
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

      if (isRegistered) {
        onAuthSuccess(user, token);
      } else {
        setTempPhone(phone);
        onNavigateToRegister(token);
      }
    } catch (err) {
      console.log('Verify OTP error details:', err.message, err.response?.data);
      setError(err.response?.data?.error || 'Invalid OTP code. Please try again.');
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
          <ShieldCheck size={36} color="#ffffff" />
        </View>

        <Text style={styles.title}>JurisMax</Text>
        <Text style={styles.subtitle}>Secure Mobile Login Portal</Text>

        {error ? (
          <View style={[styles.alert, styles.alertError]}>
            <Text style={styles.alertText}>{error}</Text>
          </View>
        ) : null}

        {infoMessage ? (
          <View style={[styles.alert, styles.alertSuccess]}>
            <Text style={styles.alertText}>{infoMessage}</Text>
          </View>
        ) : null}

        {!isOtpSent ? (
          <View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={[styles.inputWrapper, focusPhone && styles.inputWrapperFocus]}>
                <Phone
                  style={[styles.inputIcon, focusPhone && styles.inputIconFocus]}
                  size={18}
                />
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  placeholder="+91XXXXXXXXXX"
                  placeholderTextColor={COLORS.textDim}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  editable={!loading}
                  onFocus={() => setFocusPhone(true)}
                  onBlur={() => setFocusPhone(false)}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleSendOtp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text style={styles.btnPrimaryText}>Send One-Time Password</Text>
                  <ArrowRight size={18} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Enter 6-Digit OTP</Text>
              <View style={[styles.inputWrapper, focusOtp && styles.inputWrapperFocus]}>
                <KeyRound
                  style={[styles.inputIcon, focusOtp && styles.inputIconFocus]}
                  size={18}
                />
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="XXXXXX"
                  placeholderTextColor={COLORS.textDim}
                  value={otp}
                  onChangeText={(text) => setOtp(text.replace(/\D/g, ''))}
                  editable={!loading}
                  onFocus={() => setFocusOtp(true)}
                  onBlur={() => setFocusOtp(false)}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleVerifyOtp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.btnPrimaryText}>Verify & Continue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => {
                setIsOtpSent(false);
                setOtp('');
                setError('');
                setInfoMessage('');
              }}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.btnSecondaryText}>Change Phone Number</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.footerText}>
          <HelpCircle size={12} color={COLORS.textDim} /> Secure sessions expire in 7 days.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Login;

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import COLORS from '../constants/colors';
import Button from '../components/Button';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { postData } from '../API';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddAccount = () => {
  const navigation = useNavigation();
  const userData = useSelector(state => state.user);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [referralId, setReferralId] = useState(userData?.referalId || '');
  
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');

  const sendOtp = async () => {
    if (!firstName || !lastName || !email || !phone) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all fields' });
      return;
    }
    
    setLoading(true);
    try {
      const response = await postData('/api/auth/send-otp', { phone });
      console.log('Send OTP Response:', response);
      
      if (response.Status) {
        Toast.show({ type: 'success', text1: 'OTP Sent', text2: `OTP sent to ${phone}` });
        setShowOtpInput(true);
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: response.message || 'Failed to send OTP' });
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async () => {
    if (!otp) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter OTP' });
      return;
    }

    setLoading(true);
    try {
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      const payload = {
        phone,
        otp,
        ResponseStatus: 1, // Assuming verified
        firstName,
        lastName,
        email,
        deviceToken: fcmToken,
        referalId: referralId, // Linking to current user
      };
      
      console.log('Register Payload:', payload);

      const response = await postData('/api/auth/user-register', payload);
      console.log('Register Response:', response);

      if (response?.Status === true) {
        Alert.alert('Success', 'Account added successfully!', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
        // navigation.goBack();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: response?.data?.message || response?.message || 'Registration Failed' });
      }
    } catch (error) {
      console.error('Register Error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: error?.response?.data?.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Add Account</Text>
      </View>

      <View style={styles.form}>
        {!showOtpInput ? (
          <>
            <Text style={styles.label}>First Name</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First Name" />
            
            <Text style={styles.label}>Last Name</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last Name" />

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone Number" keyboardType="phone-pad" maxLength={10} />

            <Text style={styles.label}>Referral ID (Auto-filled)</Text>
            <TextInput style={[styles.input, { backgroundColor: '#f0f0f0' }]} value={referralId} editable={false} />

            <Button 
                title={loading ? <ActivityIndicator color="#fff"/> : "Verify & Add"} 
                onpress={sendOtp} 
                style={{ marginTop: 20 }}
            />
          </>
        ) : (
            <>
                <Text style={styles.label}>Enter OTP sent to {phone}</Text>
                <TextInput 
                    style={styles.input} 
                    value={otp} 
                    onChangeText={setOtp} 
                    placeholder="Enter 6-digit OTP" 
                    keyboardType="numeric" 
                    maxLength={6}
                />
                 <Button 
                    title={loading ? <ActivityIndicator color="#fff"/> : "Submit"} 
                    onpress={registerUser} 
                    style={{ marginTop: 20 }}
                />
                <TouchableOpacity onPress={() => setShowOtpInput(false)} style={{marginTop: 15, alignItems: 'center'}}>
                    <Text style={{color: COLORS.primary}}>Change Details</Text>
                </TouchableOpacity>
            </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '600',
    marginLeft: 15,
    color: COLORS.black,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: '#fafafa',
  },
});

export default AddAccount;

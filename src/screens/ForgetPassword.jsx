import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import COLORS from '../constants/colors';
import Button from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import { postData } from '../API';

export default function ForgetPassword() {
  const navigation = useNavigation();

  const [phn, setPhn] = useState('');
  const [otp, setOtp] = useState('');
  const [mpin, setMpin] = useState('');

  // ---------------- SEND OTP BUTTON LOGIC ----------------
  const handleSendOTP = async () => {
    try {
      const res = await postData('api/user/mpin-verify-otp', { otp : otp, newMpin: mpin });
      console.log(res);
      if (res.Status) Alert.alert("MPIN UPDATED CONGO !!!!!!!")
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to send OTP');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ----------- HEADER ----------- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forget MPIN</Text>
      </View>

      {/* ----------- SUB TEXT ----------- */}
      <View style={styles.subContainer}>
        <Text style={styles.sub}>
          Reset your MPIN easily by verifying with OTP.
        </Text>
      </View>

      {/* ----------- INPUTS ----------- */}
      <View style={styles.inputContainer}>
        {/* OTP INPUT */}
        <Text style={styles.label}>OTP</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />

        {/* MPIN INPUT */}
        <Text style={styles.label}>New MPIN</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter New MPIN"
          secureTextEntry
          keyboardType="number-pad"
          maxLength={4}
          value={mpin}
          onChangeText={setMpin}
        />
      </View>

      {/* ----------- SUBMIT BUTTON ----------- */}
      <View style={styles.btnContainer}>
        <Button
          onpress={() =>
            handleSendOTP()
          }
          style={styles.continueBtn}
          title="Continue"
          filled
        />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 22,
    marginTop: 22,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  headerTitle: {
    color: COLORS.black,
    fontSize: 24,
    fontWeight: '600',
    marginHorizontal: '20%',
  },

  subContainer: {
    marginVertical: 40,
    marginHorizontal: 45,
  },

  sub: {
    textAlign: 'center',
    color: COLORS.black,
    fontSize: 18,
  },

  inputContainer: {
    marginBottom: 25,
    marginHorizontal: 15,
  },

  label: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
  },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },

  phoneInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
  },

  otpBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },

  otpBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  input: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },

  btnContainer: {
    marginTop: 150,
  },

  continueBtn: {
    margin: 15,
  },
});

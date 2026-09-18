import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import COLORS from '../constants/colors';
import Button from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import { postData } from '../API';

export default function ForgetPassword() {
  const navigation = useNavigation();

  const [phn, setPhn] = useState('');
  const [otp, setOtp] = useState('');
  const [mpin, setMpin] = useState('');

  useEffect(() => {
    postData('api/user/mpin-forgot', {}).then(res => {
      console.log(res);
    });
  }, []);

  // ---------------- SEND OTP BUTTON LOGIC ----------------
  const handleSendOTP = async () => {
    try {
      const res = await postData('api/user/mpin-verify-otp', {
        otp: otp,
        newMpin: mpin,
      });
      console.log(res);
      if (res.Status){
        Alert.alert('MPIN UPDATED CONGO !!!!!!!');
        navigation.goBack();
      }
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
          <Icon name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forget MPIN</Text>
      </View>

      <View style={styles.bodyContainer}>
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
            onpress={() => handleSendOTP()}
            style={styles.continueBtn}
            title="Continue"
            filled
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#471d7d',
  },
  header: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 19,
    fontWeight: '800',
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
  },
  subContainer: {
    marginVertical: 40,
    marginHorizontal: 20,
  },
  sub: {
    textAlign: 'center',
    color: COLORS.black,
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
    marginLeft: 4,
  },
  input: {
    borderColor: '#471d7d',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
    marginBottom: 20,
  },
  btnContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  continueBtn: {
    backgroundColor: '#471d7d',
  },
});

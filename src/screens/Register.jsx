import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  SafeAreaView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import COLORS from '../constants/colors';
import Button from '../components/Button';
import Icon from 'react-native-vector-icons/Ionicons'; // Changed to Ionicons for better arrow icons
import { useRoute } from '@react-navigation/native';
import { postData } from '../API';
import DeviceInfo from 'react-native-device-info';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../redux/actions/userActions';
import Toast from 'react-native-toast-message';
import configureStore from '../redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import { IndiaData } from '../constants/indiaData';

const Register = ({ navigation }) => {
  const dispatch = useDispatch();
  const userState = useSelector(state => state);

  const route = useRoute();
  const { phone, Otp } = route.params;

  // Form States
  const [userType, setUserType] = useState('Retailer'); // Default Read-only
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedState, setSelectedState] = useState(null);
  const [district, setDistrict] = useState(null);
  const [districtList, setDistrictList] = useState([]);
  const [gender, setGender] = useState('Male');
  const [Referal, setReferal] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [emailValidity, setEmailValidity] = useState(true);
  const [error, setError] = useState('');

  const  handleCheckEmail = text => {
    const emailRegex =
      /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    setEmail(text);
    if (emailRegex.test(text)) {
      setEmailValidity(true);
    } else {
      setEmailValidity(false);
      // setError('Invalid Email'); // Don't show error immediately while typing
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dob;
    setShowDatePicker(Platform.OS === 'ios');
    setDob(currentDate);
  };

  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const handleRegister = async () => {
    setError('');
    
    // Basic Validation
    if (!firstName || !lastName || !email || !selectedState || !district) {
      setError('Please fill all required fields');
      Toast.show({
        type: 'error',
        text1: 'Required Fields',
        text2: 'Please fill all fields',
      });
      return;
    }

    if (!emailValidity) {
      setError('Invalid Email');
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email',
      });
      return;
    }

    if (!termsAccepted) {
        Toast.show({
            type: 'error',
            text1: 'Terms & Conditions',
            text2: 'Please accept terms and conditions',
          });
        return;
    }

    try {
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      console.log('Register screen sending FCM token:', fcmToken);

      // Construct Payload - Sending extra fields even if API doesn't usage them yet
      const payload = {
        phone: phone,
        otp: Otp,
        ResponseStatus: 1,
        firstName: firstName,
        lastName: lastName,
        email: email,
        deviceToken: fcmToken,
        referalId: Referal,
        // userType, // Backend might not accept these yet
        // dob: formatDate(dob),
        // state: selectedState,
        // district: district,
        // gender: gender
      };

      const response = await postData(`/api/auth/user-register`, payload);

      console.log('Register Response →', response);

      if (response?.Status === true) {
        dispatch(setUser(response));
        navigation.navigate('CreatePassword', {
          email,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message ?? 'Something went wrong',
        });
      }
    } catch (err) {
      console.log('Register API Error:', err?.response?.data ?? err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err?.response?.data?.message ?? 'Something went wrong',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Signup</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* User Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select User Type</Text>
          <View style={[styles.inputContainer, styles.readOnlyInput]}>
            <Text style={styles.inputText}>{userType}</Text>
          </View>
        </View>

        {/* Name - First & Last */}
        <View style={styles.row}>
            <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter First Name"
                placeholderTextColor="#999"
                value={firstName}
                onChangeText={setFirstName}
            />
            </View>
            <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter Last Name"
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={setLastName}
            />
            </View>
        </View>

        {/* State and District */}
        <View style={styles.row}>
        {/* State */}
        <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
          <Text style={styles.label}>Select State</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={IndiaData}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select State"
            searchPlaceholder="Search..."
            value={selectedState}
            onChange={item => {
              setSelectedState(item.value);
              setDistrictList(item.districts);
              setDistrict(null);
            }}
          />
        </View>

        {/* District */}
        <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
          <Text style={styles.label}>Select District</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={districtList}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select District"
            searchPlaceholder="Search..."
            value={district}
            onChange={item => {
              setDistrict(item.value);
            }}
          />
        </View>
        </View>

        {/* Mobile */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile</Text>
          <View style={[styles.inputContainer, styles.readOnlyInput]}>
             <Text style={styles.inputText}>{phone}</Text>
          </View>
        </View>
        
        {/* Email */}
        <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={handleCheckEmail}
                keyboardType="email-address"
            />
        </View>

        {/* DOB */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select DOB</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputContainer}>
            <Text style={styles.inputText}>{formatDate(dob)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dob}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* State */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select State</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={IndiaData}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select State"
            searchPlaceholder="Search..."
            value={selectedState}
            onChange={item => {
              setSelectedState(item.value);
              setDistrictList(item.districts);
              setDistrict(null); // Reset district when state changes
            }}
          />
        </View>

        {/* District */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select District</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={districtList}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select District"
            searchPlaceholder="Search..."
            value={district}
            onChange={item => {
              setDistrict(item.value);
            }}
          />
        </View>

        {/* Gender */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Gender</Text>
          <View style={styles.genderContainer}>
             <TouchableOpacity 
                style={[styles.genderBtn, gender === 'Male' && styles.genderBtnActive]}
                onPress={() => setGender('Male')}
             >
                <Text style={[styles.genderText, gender === 'Male' && styles.genderTextActive]}>Male</Text>
             </TouchableOpacity>
             <TouchableOpacity 
                style={[styles.genderBtn, gender === 'Female' && styles.genderBtnActive]}
                onPress={() => setGender('Female')}
             >
                <Text style={[styles.genderText, gender === 'Female' && styles.genderTextActive]}>Female</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* Referral */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Referral</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Referral (Optional)"
            placeholderTextColor="#999"
            value={Referal}
            onChangeText={setReferal}
          />
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
            <BouncyCheckbox
                size={22}
                fillColor={COLORS.primary}
                unfillColor="#FFFFFF"
                text="Yes, I agree with all Terms & Conditions"
                iconStyle={{ borderColor: COLORS.primary }}
                innerIconStyle={{ borderWidth: 2 }}
                textStyle={{ textDecorationLine: "none", fontSize: 14, color: COLORS.black }}
                onPress={(isChecked) => {
                    setTermsAccepted(isChecked);
                }}
            />
        </View>
        <TouchableOpacity onPress={()=>navigation.navigate('TermsAndConditions')}>
            <Text style={styles.linkText}>Read Terms & Conditions</Text>
        </TouchableOpacity>

        {/* Submit */}
        <View style={{marginTop: 30, marginBottom: 50}}>
            <Button
                title="Register"
                filled
                style={{ borderRadius: 8 }}
                onpress={handleRegister}
            />
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: COLORS.primary,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  scrollContainer: {
    padding: 20,
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between'
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000',
    height: 50,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 12,
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  readOnlyInput: {
      backgroundColor: '#f5f5f5',
      borderColor: '#e0e0e0',
  },
  inputText: {
    fontSize: 16,
    color: '#000',
  },
  genderContainer: {
      flexDirection: 'row',
  },
  genderBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#ccc',
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 5,
      marginRight: 10,
  },
  genderBtnActive: {
      borderColor: COLORS.primary,
      backgroundColor: '#F0FDF4', // Light green bg
  },
  genderText: {
      fontSize: 16,
      color: '#666',
  },
  genderTextActive: {
      color: COLORS.primary,
      fontWeight: '600',
  },
  termsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
  },
  linkText: {
      color: COLORS.primary,
      marginLeft: 32,
      marginTop: 5,
      fontSize: 13,
      fontWeight: '500'
  },
  dropdown: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    backgroundColor: 'white',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'black',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default Register;

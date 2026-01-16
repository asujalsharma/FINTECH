import React, { useEffect, useState } from 'react';
import { TextInput, Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import COLORS from '../constants/colors';
import Button from '../components/Button';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { URL } from '../constants/URL';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postData } from '../API';

const CreatePassword = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { email } = route.params;

  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [isMpinVisible, setIsMpinVisible] = useState(true);
  const [isConfirmMpinVisible, setIsConfirmMpinVisible] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    const addEmailToStorage = async () => {
      try {
        await AsyncStorage.setItem('email', email);
      } catch (error) {
        console.error('Error adding email to AsyncStorage:', error);
      }
    };
    addEmailToStorage();
  }, [email]);

  const validateMPIN = value => {
    const regex = /^[0-9]{4}$/; // only 4 digits
    return regex.test(value);
  };

  const handleSubmit = async () => {
    if (!validateMPIN(mpin)) {
      setErrorText('MPIN must be exactly 4 digits');
      Toast.show({
        type: 'error',
        text1: 'Invalid MPIN',
        text2: 'MPIN must be exactly 4 digits',
      });
      return;
    }

    if (mpin !== confirmMpin) {
      setErrorText('MPIN does not match');
      Toast.show({
        type: 'error',
        text1: 'Mismatch',
        text2: 'Both MPINs must match',
      });
      return;
    }

    try {
      const response = await postData(`/api/user/mpin-generate`, {
        mPin: mpin.toString(),
      });
      console.log(response);
      if (response.Status === true) {
        navigation.navigate('Home');
      } else {
        setErrorText(response.data.message);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: `${response.data.message}`,
        });
      }
    } catch (error) {
      console.error(error);
      setErrorText('An unexpected error occurred. Please try again.');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Something went wrong`,
      });
    }
  };

  return (
    <View
      style={{
        marginHorizontal: 22,
        marginTop: 22,
      }}
    >
      <View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={COLORS.black} />
        </TouchableOpacity>

        <Text
          style={{
            marginTop: -28,
            fontSize: 22,
            fontWeight: '500',
            color: COLORS.black,
            alignSelf: 'center',
          }}
        >
          Create MPIN
        </Text>
      </View>

      {/* MPIN */}
      <View
        style={{
          marginTop: 22,
          marginBottom: 32,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '400',
            color: COLORS.black,
          }}
        >
          MPIN
        </Text>

        <View
          style={{
            width: '100%',
            height: 48,
            borderWidth: 2,
            borderColor: '#471d7d',
            borderRadius: 8,
          }}
        >
          <TextInput
            secureTextEntry={isMpinVisible}
            placeholder="Enter 4-digit MPIN"
            placeholderTextColor="#9E9E9E"
            value={mpin}
            maxLength={4}
            keyboardType="numeric"
            onChangeText={text => setMpin(text)}
            style={{
              fontSize: 16,
              fontWeight: '400',
              width: '100%',
              paddingLeft: 10,
            }}
          />

          <TouchableOpacity
            onPress={() => setIsMpinVisible(!isMpinVisible)}
            style={{
              position: 'absolute',
              right: 12,
              top: 10,
            }}
          >
            {isMpinVisible ? (
              <Icon name="eye" size={24} color="'#471d7d'" />
            ) : (
              <Icon name="eye-slash" size={24} color="'#471d7d'" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={{ marginTop: 4 }}>Must be exactly 4 digits</Text>
      </View>

      {/* Confirm MPIN */}
      <View style={{ marginBottom: 32 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '400',
            color: COLORS.black,
          }}
        >
          Confirm MPIN
        </Text>

        <View
          style={{
            width: '100%',
            height: 48,
            borderWidth: 2,
            borderColor: '#471d7d',
            borderRadius: 8,
          }}
        >
          <TextInput
            secureTextEntry={isConfirmMpinVisible}
            placeholder="Re-enter MPIN"
            placeholderTextColor="#9E9E9E"
            value={confirmMpin}
            maxLength={4}
            keyboardType="numeric"
            onChangeText={text => setConfirmMpin(text)}
            style={{
              fontSize: 16,
              fontWeight: '400',
              width: '100%',
              paddingLeft: 10,
            }}
          />

          <TouchableOpacity
            onPress={() => setIsConfirmMpinVisible(!isConfirmMpinVisible)}
            style={{
              position: 'absolute',
              right: 12,
              top: 10,
            }}
          >
            {isConfirmMpinVisible ? (
              <Icon name="eye" size={24} color="'#471d7d'" />
            ) : (
              <Icon name="eye-slash" size={24} color="'#471d7d'" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Button
        onpress={handleSubmit}
        style={{
          marginTop: 350,
          backgroundColor: '#58007b',
          borderColor: '#58007b',
        }}
        title="Confirm"
        filled
      />
    </View>
  );
};

export default CreatePassword;

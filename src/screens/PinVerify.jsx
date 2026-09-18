import { Image, SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import ReactNativePinView from 'react-native-pin-view';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import COLORS from '../constants/colors';
import logo from '../Assets/nexpay.png';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { URL } from '../constants/URL';

const PinVerify = () => {
  const pinView = useRef(null);
  const route = useRoute();
  const { data, amount } = route.params;
  const [enteredPin, setEnteredPin] = useState('');

  const navigation = useNavigation();
  useEffect(() => {
    const pinFetch = async () => {
      const email = await AsyncStorage.getItem('email');
      console.log(email);
      try {
        if (enteredPin.length === 4) {
          const response = await axios.post(`${URL}/api/pinverify`, {
            pin: parseInt(enteredPin),
            email,
          });
          if (response.data.success === true) {
            navigation.navigate('Created', { data: data, amount: amount });
          } else if (response.data.success === false) {
            console.log('incorrect pin');
            pinView.current.clearAll();
          }
        }
      } catch (error) {
        console.log(error);
        console.log('incorrectt pin');
        Toast.show({
          type: 'error',
          text1: 'Invalid Pin',
          text2: 'Please enter a valid pin',
        });
        pinView.current.clearAll();
      }
    };
    pinFetch();
  }, [enteredPin]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify MPIN</Text>
      </View>
      <View style={styles.bodyContainer}>
        <Image source={logo} style={{ width: 120, height: 30, alignSelf: 'center', marginTop: 30, marginBottom: 20 }} />
        <View style={styles.pincontainer}>
          <ReactNativePinView
            inputSize={20}
            ref={pinView}
            pinLength={4}
            buttonSize={60}
            onValueChange={value => setEnteredPin(value)}
            buttonAreaStyle={{
              marginTop: 24,
            }}
            inputAreaStyle={{
              marginBottom: 40,
            }}
            inputViewEmptyStyle={{
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderColor: '#471d7d',
            }}
            inputViewFilledStyle={{
              backgroundColor: '#471d7d',
            }}
            buttonViewStyle={{
              borderColor: COLORS.low_grey,
              borderBottomWidth: 1,
              borderRadius: 0,
            }}
            buttonTextStyle={{
              color: COLORS.black,
              fontSize: 25,
            }}
            onButtonPress={key => {
              if (key === 'custom_right') {
                pinView.current.clear();
              }
            }}
            customRightButton={
              <MaterialIcon
                name="backspace-outline"
                size={25}
                color={COLORS.black}
              />
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PinVerify;

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
  pincontainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 20,
  },
});

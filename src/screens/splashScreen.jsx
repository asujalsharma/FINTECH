import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { postData } from '../../API';

const SplashScreen = () => {
  //   const getToken = async ()  => {
  //       // let body = {
  //       //   mobile: phone,
  //       // };
  //       // if (!phone || phone.length < 10) {
  //       //   Alert.alert('Please enter a valid mobile number');
  //       //   return;
  //       // }
  //       // console.log("Login request body:", body);

  //       const response = await postData('auth/login',{
  //                           email:"amit@gmail.com",
  //                           password:"123456"});
  //       if (response.status) {
  //         // successToast(t('register.registerSuccess'));
  //         console.log("Login successful", response);
  //     }
  //       else {
  //         // errorToast(t('register.somethingWentWrong'));
  //         console.log("Login failed", response);
  //       }
  //     };

  //    useEffect(() => {
  //     getToken()
  //     },[])
  return (
    <View style={styles.container}>
      <FastImage
        source={require('../Assets/splashScreen.png')}
        style={styles.logo}
        // resizeMode={FastImage.resizeMode.contain}
      />
      {/* <Text style={styles.title}>My App</Text> */}
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // flex: 1,
    width: '100%',
    height: '50%',
    margin: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
});

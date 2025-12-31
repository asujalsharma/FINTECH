import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, PermissionsAndroid } from 'react-native';

export async function requestUserPermission() {
  try {
    // 🍎 iOS permission
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log('iOS permission:', enabled);
    }

    // 🤖 Android 13+ permission (ONLY for showing notifications)
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      console.log('Android POST_NOTIFICATIONS:', granted);
    }

    // 🔥 ALWAYS get token (all platforms)
    await getFCMToken();
  } catch (err) {
    console.log('Permission / Token error:', err);
  }
}

export async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    console.log('🔥 FCM TOKEN:', token);

    if (token) {
      await AsyncStorage.setItem('fcmToken', token);
    }

    return token;
  } catch (err) {
    console.log('❌ getFCMToken error:', err);
  }
}

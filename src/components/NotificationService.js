import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function requestUserPermission() {
  console.log('🟦 requestUserPermission CALLED');

  const authStatus = await messaging().requestPermission();
  console.log('🟩 Permission status:', authStatus);

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('🟩 Permission GRANTED, calling getFCMToken()');
    await getFCMToken();
  } else {
    console.log('🟥 Permission DENIED');
  }
}

export async function getFCMToken() {
  console.log('🟦 getFCMToken CALLED');

  try {
    const token = await messaging().getToken();
    console.log('🔥 FCM Token:', token);

    await AsyncStorage.setItem('fcmToken', token);
    return token;
  } catch (error) {
    console.log('🟥 ERROR getting FCM token:', error);
  }
}

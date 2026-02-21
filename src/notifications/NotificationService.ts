import {
  getMessaging,
  getToken,
  requestPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function requestUserPermission() {
  const messaging = getMessaging();
  const authStatus = await requestPermission(messaging);
  const enabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Permission granted');
    await getFCMToken();
  }
}

export async function getFCMToken() {
  const messaging = getMessaging();
  const token = await getToken(messaging);
  console.log('FCM Token:', token);

  await AsyncStorage.setItem('fcmToken', token);

  return token;
}


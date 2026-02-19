import React, { useEffect, useState } from 'react';
import SplashScreen from './src/screens/splashScreen';
import Navigation from './src/navigation/Navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/redux/store'; // ✅ <-- keep this (import store & persistor directly)
import FlashMessage from 'react-native-flash-message';
import Orientation from 'react-native-orientation-locker';
import { requestUserPermission } from './src/notifications/NotificationService';
import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  AndroidStyle,
} from '@notifee/react-native';
import { PermissionsAndroid, Platform } from 'react-native';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = messaging().onMessage(async msg => {
      console.log('🔥 FIREBASE MESSAGE RECEIVED:', msg);
    });

    return unsub;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    Orientation.lockToPortrait();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    requestUserPermission();
  }, []);

  useEffect(() => {
    async function askPermission() {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        console.log('POST_NOTIFICATIONS permission:', granted);
      }
    }
    askPermission();
  }, []);

  useEffect(() => {
    async function createChannel() {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH, // 🔥 REQUIRED
        visibility: AndroidVisibility.PUBLIC, // 🔥 REQUIRED
      });
    }

    createChannel();
  }, []);

  // Foreground Notification Listener
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Foreground Notification:', remoteMessage);

      // Extract the image URL from FCM
      let imageUrl =
        remoteMessage.notification?.android?.imageUrl ||
        remoteMessage.data?.image ||
        null;

      await notifee.displayNotification({
        title: remoteMessage.notification?.title ?? 'New Notification',
        body: remoteMessage.notification?.body ?? '',
        android: {
          channelId: 'default',
          smallIcon: 'ic_notification',
          color: '#2196F3',
          pressAction: { id: 'default' },

          // ⭐ Only show Big Picture Style when image exists
          style: imageUrl
            ? {
                type: AndroidStyle.BIGPICTURE,
                picture: imageUrl,
              }
            : undefined,
        },
      });
    });

    return unsubscribe;
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar backgroundColor={'#000000ff'} barStyle="dark-content" />
          <Navigation />
          <FlashMessage position="top" />
        </SafeAreaView>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0BB4D4',
  },
});

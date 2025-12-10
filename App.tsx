import React, { useEffect, useState } from 'react';
import SplashScreen from './src/screens/splashScreen';
import Navigation from './src/navigation/Navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/redux/store';
import FlashMessage from 'react-native-flash-message';
import Orientation from 'react-native-orientation-locker';
import notifee from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { requestUserPermission } from './src/components/NotificationService';

export default function App() {
  const [loading, setLoading] = useState(true);

  // 🔹 Ask permission + generate token
  useEffect(() => {
    requestUserPermission();
  }, []);

  useEffect(() => {
    messaging()
      .getToken()
      .then(t => console.log('🔥 DIRECT TOKEN:', t))
      .catch(e => console.log('❌ DIRECT TOKEN ERROR:', e));
  }, []);

  // 🔹 Lock screen orientation
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 5001);
    Orientation.lockToPortrait();
    return () => clearTimeout(timer);
  }, []);

  // 🔹 Create Android notification channel
  useEffect(() => {
    async function createChannel() {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });
    }
    createChannel();
  }, []);

  // 🔹 Handle foreground notifications
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'Notification',
        body: remoteMessage.notification?.body || '',
        android: { channelId: 'default' },
      });
    });

    return unsubscribe;
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar backgroundColor={'#122536ff'} barStyle="dark-content" />
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
    backgroundColor: '#bedce6',
  },
});

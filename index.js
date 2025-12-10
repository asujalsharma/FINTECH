/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

// BACKGROUND NOTIFICATION HANDLER (APP KILLED / BACKGROUND)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background Message:', remoteMessage);

  // Create channel for Android (required)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  // Display Notification
  await notifee.displayNotification({
    title: remoteMessage?.notification?.title || 'New Notification',
    body: remoteMessage?.notification?.body || '',
    android: {
      channelId,
      pressAction: { id: 'default' },
    },
  });
});

LogBox.ignoreLogs(['Encountered two children with the same key,']);

AppRegistry.registerComponent(appName, () => App);

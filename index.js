/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import { startNetworkLogging } from 'react-native-network-logger';
import App from './App';
import { name as appName } from './app.json';

// Start intercepting all network requests (fetch, axios, XMLHttpRequest)
startNetworkLogging();

LogBox.ignoreLogs(['Encountered two children with the same key,']); // Ignore log notification by message

// Register component for appName and legacy native bundle names (YaaraPay, Sarvana, Pinpay)
const appNames = new Set([appName, 'Sarvana', 'YaaraPay', 'Pinpay', 'FINTECH']);
appNames.forEach(name => {
  if (name) {
    AppRegistry.registerComponent(name, () => App);
  }
});

/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import { enableScreens, enableFreeze } from 'react-native-screens';
import App from './App';
import { name as appName } from './app.json';

// Optimize native navigation memory usage:
// - enableScreens uses native Fragments/ViewControllers to detach inactive screens from the hierarchy
// - enableFreeze suspends re-renders and computation on inactive stack screens
enableScreens(true);
enableFreeze(true);

// Optimize memory in production:
// 1. Strip console statements in production to stop serializing/retaining objects in RAM
// 2. Only run network logging during development to prevent unbounded in-memory request buffering
if (__DEV__) {
  try {
    const { startNetworkLogging } = require('react-native-network-logger');
    startNetworkLogging({ maxRequests: 50 });
  } catch (_e) {}
} else {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.warn = () => {};
}

LogBox.ignoreLogs(['Encountered two children with the same key,']); // Ignore log notification by message

// Register component for appName and legacy native bundle names (YaaraPay, Sarvana, Pinpay)
const appNames = new Set([appName, 'Sarvana', 'YaaraPay', 'Pinpay', 'FINTECH']);
appNames.forEach(name => {
  if (name) {
    AppRegistry.registerComponent(name, () => App);
  }
});


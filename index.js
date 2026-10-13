/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { startNetworkLogging } from 'react-native-network-logger';

if (__DEV__) {
  startNetworkLogging();
}

LogBox.ignoreLogs(['Encountered two children with the same key,']); // Ignore log notification by message

AppRegistry.registerComponent(appName, () => App);

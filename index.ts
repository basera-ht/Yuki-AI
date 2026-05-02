import './polyfills';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isWeb = Platform.OS === 'web';

// We only need the React Native WebRTC polyfills on physical native devices, not on web or Expo Go
if (!isExpoGo && !isWeb) {
  const { registerGlobals } = require('@livekit/react-native');
  registerGlobals();
}

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);

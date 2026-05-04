import './polyfills';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isWeb = Platform.OS === 'web';

// Register WebRTC globals BEFORE any app code that uses LiveKit/ElevenLabs
if (!isExpoGo && !isWeb) {
  const { registerGlobals } = require('@livekit/react-native');
  registerGlobals();
}

// IMPORTANT: Use dynamic require() instead of static import to prevent Metro
// from hoisting App above registerGlobals(). Static imports are evaluated
// before any runtime code, which would cause RTCPeerConnection to be undefined
// when the ElevenLabs/LiveKit SDK initializes inside App.tsx.
const { registerRootComponent } = require('expo');
const App = require('./App').default;

registerRootComponent(App);

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, Text, View, Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { ChatInterface } from './src/components/ChatInterface';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isWeb = Platform.OS === 'web';
const isVoiceSupported = !isExpoGo || isWeb;

const HoldToTalk = isVoiceSupported ? require('./src/components/HoldToTalkInterface').HoldToTalkInterface : null;

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {!isVoiceSupported ? (
        <View style={styles.expoGoContainer}>
          <Text style={styles.warningText}>
            Voice Assistant (WebRTC) is not supported in Expo Go.
            Falling back to text chat.
          </Text>
          <ChatInterface />
        </View>
      ) : (
        <HoldToTalk />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  expoGoContainer: {
    flex: 1,
  },
  warningText: {
    color: '#f39c12',
    textAlign: 'center',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

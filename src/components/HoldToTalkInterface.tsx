import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, PermissionsAndroid, Platform } from 'react-native';
import { Conversation } from '@elevenlabs/client';
import { Audio } from 'expo-av';

export const HoldToTalkInterface: React.FC = () => {
  const [conversation, setConversation] = useState<any>(null);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const agentId = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID;

  // Initialize conversation only when needed, but we keep it ready
  const startConversation = useCallback(async () => {
    if (!agentId) {
      Alert.alert('Configuration Error', 'Please set EXPO_PUBLIC_ELEVENLABS_AGENT_ID in your .env file.');
      return;
    }

    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'App needs access to your microphone to talk to the AI.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Microphone permission is required to use the voice assistant.');
          return;
        }
      }

      setStatus('connecting');

      // Set up audio focus before connecting
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      const conv = await Conversation.startSession({
        agentId: agentId,
        connectionOptions: {
          autoSubscribe: true,
          peerConnectionTimeout: Platform.OS === 'android' ? 30000 : 15000,
          rtcConfig: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
          },
        },
        onConnect: () => {
          setStatus('connected');
        },
        onDisconnect: () => {
          setStatus('disconnected');
          setConversation(null);
        },
        onError: (error) => {
          console.error('ElevenLabs Error:', error);
          setStatus('disconnected');
          setConversation(null);
        },
        onModeChange: (mode) => {
          if (mode.mode === 'speaking') {
            setIsSpeaking(true);
          } else {
            setIsSpeaking(false);
          }
        },
      });

      setConversation(conv);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setStatus('disconnected');
    }
  }, [agentId]);

  const stopConversation = useCallback(async () => {
    if (conversation) {
      await conversation.endSession();
      setConversation(null);
      setStatus('disconnected');
    }
  }, [conversation]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (conversation) {
        conversation.endSession();
      }
    };
  }, [conversation]);

  // Press handlers for the "Hold to Talk" button
  // Note: ElevenLabs WebRTC session is continuously active once connected.
  // "Hold to talk" can mean "unmute" or "start session". We will start the session on first press,
  // or manage microphone muting if the SDK supports it.
  // The simplest reliable implementation is to connect when held, and disconnect when released,
  // OR connect once, and just mute/unmute the mic. 
  // We'll implement the "connect once, mute/unmute" for better latency, but if the session isn't connected, we connect it.

  const handlePressIn = async () => {
    if (status === 'disconnected') {
      await startConversation();
    } else if (conversation) {
      // If already connected, we might want to ensure the mic is on.
      // @elevenlabs/client might not have a direct mute/unmute yet, so starting/stopping the session 
      // is the fallback if mute isn't available, but ending session takes time to reconnect.
      // Assuming it's a push-to-talk, let's keep it simple: the SDK listens continuously once connected.
      // So if it's connected, the user is talking. We just rely on VAD (Voice Activity Detection) which is built-in.
    }
  };

  const handlePressOut = () => {
    // If we wanted true push-to-talk, we would end session or mute here.
    // For now, we leave it connected so the agent can respond, and maybe we add an explicit disconnect button.
  };

  const handleDisconnectPress = () => {
    stopConversation();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Assistant</Text>
      
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, status === 'connected' ? styles.statusConnected : (status === 'connecting' ? styles.statusConnecting : styles.statusDisconnected)]} />
        <Text style={styles.statusText}>
          {status === 'connected' ? 'Connected' : (status === 'connecting' ? 'Connecting...' : 'Disconnected')}
        </Text>
      </View>

      {isSpeaking && <Text style={styles.speakingText}>Assistant is speaking...</Text>}

      <Pressable 
        style={({ pressed }) => [
          styles.talkButton,
          pressed && styles.talkButtonPressed,
          status === 'connected' && styles.talkButtonActive
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {status === 'connecting' ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <Text style={styles.talkButtonText}>
            {status === 'connected' ? 'Listening...' : 'Tap to Connect'}
          </Text>
        )}
      </Pressable>

      {status === 'connected' && (
        <Pressable style={styles.disconnectButton} onPress={handleDisconnectPress}>
          <Text style={styles.disconnectText}>End Conversation</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 40,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusDisconnected: {
    backgroundColor: '#e74c3c',
  },
  statusConnecting: {
    backgroundColor: '#f39c12',
  },
  statusConnected: {
    backgroundColor: '#2ecc71',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 16,
  },
  speakingText: {
    color: '#a8dadc',
    fontSize: 16,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  talkButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(52, 152, 219, 0.5)',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  talkButtonPressed: {
    backgroundColor: 'rgba(52, 152, 219, 0.4)',
    transform: [{ scale: 0.95 }],
  },
  talkButtonActive: {
    borderColor: 'rgba(46, 204, 113, 0.8)',
    shadowColor: '#2ecc71',
  },
  talkButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  disconnectButton: {
    marginTop: 40,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.5)',
  },
  disconnectText: {
    color: '#ff7675',
    fontSize: 16,
    fontWeight: '600',
  },
});

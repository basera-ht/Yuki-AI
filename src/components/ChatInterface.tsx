import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import { MessageBubble } from './MessageBubble';
import { fetchContacts, SimplifiedContact } from '../services/contactsService';
import { generateAssistantResponse } from '../services/geminiService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hi! I am your personal AI assistant. How can I help you today?', isUser: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<SimplifiedContact[] | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Fetch contacts on mount
  useEffect(() => {
    const loadContacts = async () => {
      const fetchedContacts = await fetchContacts();
      setContacts(fetchedContacts);
    };
    loadContacts();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const newUserMsg: Message = { id: Date.now().toString(), text: userText, isUser: true };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsLoading(true);

    // Call Gemini API
    const responseText = await generateAssistantResponse(userText, contacts);
    
    const newAiMsg: Message = { id: (Date.now() + 1).toString(), text: responseText, isUser: false };
    setMessages(prev => [...prev, newAiMsg]);
    setIsLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MessageBubble text={item.text} isUser={item.isUser} />}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    paddingVertical: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  input: {
    flex: 1,
    minHeight: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    paddingHorizontal: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: 'rgba(52, 152, 219, 0.8)',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 1)',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(52, 152, 219, 0.4)',
    borderColor: 'rgba(52, 152, 219, 0.5)',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

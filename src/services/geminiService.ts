import { GoogleGenerativeAI } from '@google/generative-ai';
import { SimplifiedContact } from './contactsService';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export const generateAssistantResponse = async (
  prompt: string,
  contacts: SimplifiedContact[] | null
): Promise<string> => {
  if (!apiKey) {
    return 'Error: Gemini API key is missing. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.';
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const contactsContext = contacts 
      ? `Here is the user's contact list in JSON format:\n${JSON.stringify(contacts, null, 2)}`
      : `The user's contact list is currently unavailable or permissions were denied.`;

    const systemInstruction = `You are a helpful and intelligent personal AI assistant. 
Your goal is to assist the user with their requests. 
When asked about contacts (like phone numbers or emails), refer to the contact list provided below.
If the requested information is not in the list, kindly inform the user.
Keep your answers concise, clear, and friendly.

${contactsContext}`;

    const fullPrompt = `${systemInstruction}\n\nUser Request: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error communicating with Gemini:', error);
    return 'Sorry, I encountered an error while processing your request. Please try again later.';
  }
};

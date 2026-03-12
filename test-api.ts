import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function testGemini() {
  console.log('Testing Gemini API...');
  console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
  console.log('API Key starts with:', process.env.GEMINI_API_KEY?.substring(0, 15));

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    
    // Use correct model name: gemini-2.5-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent('Say hello in one sentence!');
    const response = result.response;
    const text = response.text();

    console.log('✅ Gemini API Test Successful!');
    console.log('Response:', text);
  } catch (error) {
    console.error('❌ Gemini API Test Failed:', error);
  }
}

testGemini();
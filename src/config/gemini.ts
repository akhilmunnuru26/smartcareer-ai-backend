// import Anthropic from "@anthropic-ai/sdk";
// import dotenv from "dotenv";

// dotenv.config();

// if (!process.env.Anthropic_API_KEY) {
//     throw new Error("Anthropic API Key is not defined in environment variables");
// }

// export const anthropic = new Anthropic({
//     apiKey: process.env.Anthropic_API_KEY,

// })

// export const anthropicModel = "claude-sonnet-4-20250514";


import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use Gemini 2.0 Flash (best free model)
export const MODEL_NAME = 'gemini-2.5-flash';
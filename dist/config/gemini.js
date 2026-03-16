"use strict";
// import Anthropic from "@anthropic-ai/sdk";
// import dotenv from "dotenv";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODEL_NAME = exports.genAI = void 0;
// dotenv.config();
// if (!process.env.Anthropic_API_KEY) {
//     throw new Error("Anthropic API Key is not defined in environment variables");
// }
// export const anthropic = new Anthropic({
//     apiKey: process.env.Anthropic_API_KEY,
// })
// export const anthropicModel = "claude-sonnet-4-20250514";
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
}
exports.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use Gemini 2.0 Flash (best free model)
exports.MODEL_NAME = 'gemini-2.5-flash';

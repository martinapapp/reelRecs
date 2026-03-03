import { GoogleGenerativeAI } from '@google/generative-ai';
import { neon } from '@neondatabase/serverless';

/** Gemini config */
if (!import.meta.env.VITE_GEMINI_API_KEY) throw new Error("Gemini API key is missing or invalid.")
export const geminiClient = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

/** Neon config */
if (!import.meta.env.VITE_NEON_URL) throw new Error("Neon database URL is missing.")
export const sql = neon(import.meta.env.VITE_NEON_URL)
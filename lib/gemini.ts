import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY (or GOOGLE_API_KEY).");
}

export const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const geminiClient = new GoogleGenAI({ apiKey });

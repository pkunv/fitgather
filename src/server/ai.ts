import { env } from "@/env";
import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: env.AI_STUDIO_API_KEY });

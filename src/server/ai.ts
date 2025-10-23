import { env } from "@/env";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const googleGenAI = new GoogleGenerativeAI(env.AI_STUDIO_API_KEY);

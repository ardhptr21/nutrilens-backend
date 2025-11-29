import { GoogleGenAI } from "@google/genai";
import { env } from "../utils/envConfig";

export const gemini = new GoogleGenAI({
	apiKey: env.GEMINI_API_KEY,
});

import { createPartFromUri, createUserContent } from "@google/genai";
import { StatusCodes } from "http-status-codes";
import { gemini } from "@/common/lib/gemini";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { ScanModel } from "./nutritionModel";

class NutritionService {
	public async scan(data: ScanModel["body"]) {
		const uploaded = await gemini.files.upload({
			file: data.image,
		});
		if (!uploaded.uri || !uploaded.mimeType)
			return ServiceResponse.failure("File upload failed", null, StatusCodes.INTERNAL_SERVER_ERROR);

		const result = await gemini.models.generateContent({
			model: "gemini-2.0-flash",
			contents: createUserContent([
				createPartFromUri(uploaded.uri, uploaded.mimeType),
				"\n\n",
				"Provide a detailed nutritional analysis of the food item in the image, including calorie, fat, protein, and carbs in grams. Format the response as a 'only' JSON object with appropriate keys. The json should be:\n",
				`{"name:"(in bahasa)","cal":number,"fat":number,"protein":number,"carbs":number}`,
			]),
		});

		if (!result.text)
			return ServiceResponse.failure("Failed to generate nutrition data", null, StatusCodes.INTERNAL_SERVER_ERROR);

		const jsonStart = result.text.indexOf("{");
		const jsonEnd = result.text.lastIndexOf("}") + 1;
		const jsonString = result.text.substring(jsonStart, jsonEnd);
		const nutritionData = JSON.parse(jsonString);

		return ServiceResponse.success("Nutrition data retrieved", nutritionData, StatusCodes.OK);
	}
}

export const nutritionService = new NutritionService();

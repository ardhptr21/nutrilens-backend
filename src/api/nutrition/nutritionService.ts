import { createPartFromUri, createUserContent } from "@google/genai";
import { StatusCodes } from "http-status-codes";
import { gemini } from "@/common/lib/gemini";
import { prisma } from "@/common/lib/prisma";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { ScanModel } from "./nutritionModel";

class NutritionService {
	public async scan(data: ScanModel["body"], userId: string) {
		const uploaded = await gemini.files.upload({
			file: data.image,
		});
		if (!uploaded.uri || !uploaded.mimeType)
			return ServiceResponse.failure("File upload failed", null, StatusCodes.INTERNAL_SERVER_ERROR);

		const prompts = [
			"Provide a detailed nutritional analysis of the food item in the image, including calorie, fat, protein, and carbs in grams. Format the response as a 'only' JSON object with appropriate keys. The json should be:\n",
			`{"name:"(in bahasa)","cal":number,"fat":number,"protein":number,"carbs":number}`,
		];

		if (data.detail) prompts.push(`\nAdditional details: ${data.detail}\n`);

		console.log(prompts.join(""));

		const result = await gemini.models.generateContent({
			model: "gemini-2.0-flash",
			contents: createUserContent([createPartFromUri(uploaded.uri, uploaded.mimeType), "\n\n", ...prompts]),
		});

		if (!result.text)
			return ServiceResponse.failure("Failed to generate nutrition data", null, StatusCodes.INTERNAL_SERVER_ERROR);

		const jsonStart = result.text.indexOf("{");
		const jsonEnd = result.text.lastIndexOf("}") + 1;
		const jsonString = result.text.substring(jsonStart, jsonEnd);
		const nutritionData = JSON.parse(jsonString);

		try {
			// Get user's preference for target nutrition
			const userPreference = await prisma.preference.findUnique({
				where: { userId },
			});

			// Create nutrition record for today
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const nutrition = await prisma.nutrition.create({
				data: {
					userId,
					logAt: today,
					targetCal: userPreference?.targetCal || 2500,
					targetFat: userPreference?.targetFat || 70,
					targetCarbs: userPreference?.targetCarbs || 275,
					targetProtein: userPreference?.targetProtein || 50,
					meals: {
						create: {
							name: nutritionData.name,
							cal: nutritionData.cal,
							fat: nutritionData.fat,
							protein: nutritionData.protein,
							carbs: nutritionData.carbs,
						},
					},
				},
				include: {
					meals: true,
				},
			});

			return ServiceResponse.success("Nutrition data retrieved and saved", {
				...nutritionData,
				mealId: nutrition.meals[0]?.id,
				nutritionId: nutrition.id,
			}, StatusCodes.OK);
		} catch (error) {
			console.error("Error saving nutrition data:", error);
			return ServiceResponse.success("Nutrition data retrieved (not saved)", nutritionData, StatusCodes.OK);
		}
	}
}

export const nutritionService = new NutritionService();


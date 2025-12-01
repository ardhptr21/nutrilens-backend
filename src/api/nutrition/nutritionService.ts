import { createPartFromUri, createUserContent } from "@google/genai";
import { StatusCodes } from "http-status-codes";
import FileManager from "@/common/lib/fileManager";
import { gemini } from "@/common/lib/gemini";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { preferenceRepository } from "../preference/preferenceRepository";
import type { MealUploadModel, ScanModel } from "./nutritionModel";
import { nutritionRepository } from "./nutritionRepository";

class NutritionService {
	public async scan(data: ScanModel["body"]) {
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

		return ServiceResponse.success("Nutrition data retrieved", nutritionData, StatusCodes.OK);
	}

	public async getStatistics(userId: string, date: Date) {
		try {
			const startOfDay = new Date(date);
			startOfDay.setHours(0, 0, 0, 0);

			const nutrition = await nutritionRepository.findNutritionWithMealsByUserIdAndDate(userId, startOfDay);

			if (!nutrition) {
				if (startOfDay.getTime() === new Date().setHours(0, 0, 0, 0)) {
					const userPreference = await preferenceRepository.findByUserId(userId);
					const newNutrition = await nutritionRepository.createNutrition(
						userId,
						startOfDay,
						Number(userPreference?.targetCal),
						Number(userPreference?.targetFat),
						Number(userPreference?.targetCarbs),
						Number(userPreference?.targetProtein),
					);
					return ServiceResponse.success(
						"Nutrition statistics retrieved",
						{
							id: newNutrition.id,
							logAt: newNutrition.logAt,
							cal: 0,
							fat: 0,
							protein: 0,
							carbs: 0,
							targetCal: Number(newNutrition.targetCal),
							targetFat: Number(newNutrition.targetFat),
							targetCarbs: Number(newNutrition.targetCarbs),
							targetProtein: Number(newNutrition.targetProtein),
							meals: [],
						},
						StatusCodes.OK,
					);
				}
				return ServiceResponse.success("No nutrition data found for this date", null, StatusCodes.OK);
			}

			let totalCal = 0;
			let totalFat = 0;
			let totalProtein = 0;
			let totalCarbs = 0;

			for (const meal of nutrition.meals) {
				totalCal += Number(meal.cal);
				totalFat += Number(meal.fat);
				totalProtein += Number(meal.protein);
				totalCarbs += Number(meal.carbs);
			}

			const response = {
				id: nutrition.id,
				logAt: nutrition.logAt,
				cal: totalCal,
				fat: totalFat,
				protein: totalProtein,
				carbs: totalCarbs,
				targetCal: Number(nutrition.targetCal),
				targetFat: Number(nutrition.targetFat),
				targetCarbs: Number(nutrition.targetCarbs),
				targetProtein: Number(nutrition.targetProtein),
				meals: nutrition.meals.map((meal) => ({
					id: meal.id,
					name: meal.name,
					image: meal.image,
					description: meal.description,
					cal: Number(meal.cal),
					fat: Number(meal.fat),
					protein: Number(meal.protein),
					carbs: Number(meal.carbs),
					createdAt: meal.createdAt,
				})),
			};

			return ServiceResponse.success("Nutrition statistics retrieved", response, StatusCodes.OK);
		} catch (error) {
			console.error("Error fetching nutrition statistics:", error);
			return ServiceResponse.failure("Failed to fetch nutrition statistics", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	public async getStatisticsToday(userId: string) {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return this.getStatistics(userId, today);
	}

	public async uploadMeal(data: MealUploadModel["body"], userId: string) {
		try {
			const userPreference = await preferenceRepository.findByUserId(userId);

			const today = new Date();
			today.setHours(0, 0, 0, 0);

			let nutrition = await nutritionRepository.findNutritionByUserIdAndDate(userId, today);

			if (!nutrition) {
				nutrition = await nutritionRepository.createNutrition(
					userId,
					today,
					Number(userPreference?.targetCal),
					Number(userPreference?.targetFat),
					Number(userPreference?.targetCarbs),
					Number(userPreference?.targetProtein),
				);
			}

			const imagePath = await FileManager.upload(`meals/${userId}`, data.image);

			const meal = await nutritionRepository.createMeal(
				nutrition.id,
				data.name,
				imagePath,
				data.description || null,
				data.cal,
				data.fat,
				data.protein,
				data.carbs,
			);

			return ServiceResponse.success(
				"Meal with image created successfully",
				{
					id: meal.id,
					nutritionId: nutrition.id,
					name: meal.name,
					image: meal.image,
					description: meal.description,
					cal: Number(meal.cal),
					fat: Number(meal.fat),
					protein: Number(meal.protein),
					carbs: Number(meal.carbs),
					createdAt: meal.createdAt,
				},
				StatusCodes.CREATED,
			);
		} catch (error) {
			console.error("Error creating meal with image:", error);
			return ServiceResponse.failure("Failed to create meal with image", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const nutritionService = new NutritionService();

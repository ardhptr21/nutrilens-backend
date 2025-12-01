import { createPartFromUri, createUserContent } from "@google/genai";
import { StatusCodes } from "http-status-codes";
import { gemini } from "@/common/lib/gemini";
import { prisma } from "@/common/lib/prisma";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { nutritionRepository } from "./nutritionRepository";
import type { ScanModel, CreateMealModel, MealUploadModel } from "./nutritionModel";

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

		return ServiceResponse.success("Nutrition data retrieved", nutritionData, StatusCodes.OK);
	}

	public async createMeal(data: CreateMealModel["body"], userId: string) {
		try {
			// Get user's preference
			const userPreference = await prisma.preference.findUnique({
				where: { userId },
			});

			// Create nutrition record for today (auto detect)
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			// Check if nutrition record for today already exists
			let nutrition = await prisma.nutrition.findFirst({
				where: {
					userId,
					logAt: today,
				},
			});

			// If not exists, create new
			if (!nutrition) {
				nutrition = await prisma.nutrition.create({
					data: {
						userId,
						logAt: today,
						targetCal: userPreference?.targetCal || 2500,
						targetFat: userPreference?.targetFat || 70,
						targetCarbs: userPreference?.targetCarbs || 275,
						targetProtein: userPreference?.targetProtein || 50,
					},
				});
			}

			// Create meal
			const meal = await prisma.meal.create({
				data: {
					nutritionId: nutrition.id,
					name: data.name,
					image: data.image || null,
					description: data.description || null,
					cal: data.cal,
					fat: data.fat,
					protein: data.protein,
					carbs: data.carbs,
				},
			});

			return ServiceResponse.success(
				"Meal created successfully",
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
			console.error("Error creating meal:", error);
			return ServiceResponse.failure(
				"Failed to create meal",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	public async getStatistics(userId: string, date: Date) {
		try {
			// Parse the date to get start of day
			const startOfDay = new Date(date);
			startOfDay.setHours(0, 0, 0, 0);

			// Get nutrition record for the specified date
			const nutrition = await nutritionRepository.findNutritionWithMealsByUserIdAndDate(userId, startOfDay);

			if (!nutrition) {
				return ServiceResponse.success(
					"No nutrition data found for this date",
					null,
					StatusCodes.OK,
				);
			}

			// Calculate totals
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

			return ServiceResponse.success(
				"Nutrition statistics retrieved",
				response,
				StatusCodes.OK,
			);
		} catch (error) {
			console.error("Error fetching nutrition statistics:", error);
			return ServiceResponse.failure(
				"Failed to fetch nutrition statistics",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	public async uploadMeal(data: MealUploadModel["body"], userId: string) {
		try {
			// Get user's preference
			const userPreference = await prisma.preference.findUnique({
				where: { userId },
			});

			// Create nutrition record for today (auto detect)
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			// Check if nutrition record for today already exists
			let nutrition = await nutritionRepository.findNutritionByUserIdAndDate(userId, today);

			// If not exists, create new
			if (!nutrition) {
				nutrition = await nutritionRepository.createNutrition(
					userId,
					today,
					userPreference?.targetCal,
					userPreference?.targetFat,
					userPreference?.targetCarbs,
					userPreference?.targetProtein,
				);
			}

			// Generate image path for storage
			// Format: /uploads/meals/USERID/TIMESTAMP-FILENAME
			const timestamp = Date.now();
			const imagePath = `/uploads/meals/${userId}/${timestamp}-${data.image.name}`;

			// Create meal with image path
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
			return ServiceResponse.failure(
				"Failed to create meal with image",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const nutritionService = new NutritionService();


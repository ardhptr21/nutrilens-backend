import { StatusCodes } from "http-status-codes";
import { prisma } from "@/common/lib/prisma";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { HistoryModel } from "./nutritionModel";

class NutritionHistoryService {
	public async getHistory(userId: string) {
		try {
			// Get all nutritions for the user grouped by date
			const nutritions = await prisma.nutrition.findMany({
				where: {
					userId: userId,
				},
				include: {
					meals: true,
					user: {
						select: {
							preference: true,
						},
					},
				},
				orderBy: {
					logAt: "desc",
				},
			});

			if (nutritions.length === 0) {
				return ServiceResponse.success("No nutrition history found", [], StatusCodes.OK);
			}

			// Group and aggregate by date
			const groupedByDate = new Map<string, (typeof nutritions)[0][]>();

			for (const nutrition of nutritions) {
				const dateKey = nutrition.logAt.toISOString().split("T")[0];
				if (!groupedByDate.has(dateKey)) {
					groupedByDate.set(dateKey, []);
				}
				groupedByDate.get(dateKey)!.push(nutrition);
			}

			// Aggregate data per date
			const historyData: HistoryModel[] = [];

			for (const [dateStr, nutritionList] of groupedByDate) {
				const date = new Date(dateStr);

				let totalCal = 0;
				let totalFat = 0;
				let totalProtein = 0;
				let totalCarbs = 0;

				for (const nutrition of nutritionList) {
					for (const meal of nutrition.meals) {
						totalCal += Number(meal.cal);
						totalFat += Number(meal.fat);
						totalProtein += Number(meal.protein);
						totalCarbs += Number(meal.carbs);
					}
				}

				// Get target calories from first user's preference (they're all the same)
				const calorieGoal =
					nutritionList[0]?.user?.preference?.targetCal || nutritionList[0]?.targetCal || 2500;

				historyData.push({
					id: dateStr,
					date: date,
					totalCalories: totalCal,
					calorieGoal: Number(calorieGoal),
					protein: totalProtein,
					fat: totalFat,
					carbs: totalCarbs,
				});
			}

			return ServiceResponse.success("Nutrition history retrieved", historyData, StatusCodes.OK);
		} catch (error) {
			console.error("Error fetching nutrition history:", error);
			return ServiceResponse.failure(
				"Failed to fetch nutrition history",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	public async getHistoryDetail(userId: string, date: Date) {
		try {
			// Parse the date to get start and end of day
			const startOfDay = new Date(date);
			startOfDay.setHours(0, 0, 0, 0);

			const endOfDay = new Date(date);
			endOfDay.setHours(23, 59, 59, 999);

			// Get all meals for the user on the specified date
			const nutritions = await prisma.nutrition.findMany({
				where: {
					userId: userId,
					logAt: {
						gte: startOfDay,
						lte: endOfDay,
					},
				},
				include: {
					meals: true,
					user: {
						select: {
							preference: true,
						},
					},
				},
			});

			if (nutritions.length === 0) {
				return ServiceResponse.success("No nutrition data found for this date", [], StatusCodes.OK);
			}

			// Aggregate all meals
			const meals = nutritions.flatMap((n) => n.meals);

			let totalCal = 0;
			let totalFat = 0;
			let totalProtein = 0;
			let totalCarbs = 0;

			for (const meal of meals) {
				totalCal += Number(meal.cal);
				totalFat += Number(meal.fat);
				totalProtein += Number(meal.protein);
				totalCarbs += Number(meal.carbs);
			}

			const calorieGoal =
				nutritions[0]?.user?.preference?.targetCal || nutritions[0]?.targetCal || 2500;

			const response = {
				id: date.toISOString().split("T")[0],
				date: date,
				totalCalories: totalCal,
				calorieGoal: Number(calorieGoal),
				protein: totalProtein,
				fat: totalFat,
				carbs: totalCarbs,
				meals: meals.map((meal) => ({
					id: meal.id,
					name: meal.name,
					description: meal.description,
					cal: Number(meal.cal),
					fat: Number(meal.fat),
					protein: Number(meal.protein),
					carbs: Number(meal.carbs),
					createdAt: meal.createdAt,
				})),
			};

			return ServiceResponse.success("Nutrition history detail retrieved", response, StatusCodes.OK);
		} catch (error) {
			console.error("Error fetching nutrition history detail:", error);
			return ServiceResponse.failure(
				"Failed to fetch nutrition history detail",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const nutritionHistoryService = new NutritionHistoryService();

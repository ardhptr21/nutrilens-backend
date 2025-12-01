import { prisma } from "@/common/lib/prisma";

class NutritionRepository {
	async findNutritionByUserIdAndDate(userId: string, date: Date) {
		return await prisma.nutrition.findFirst({
			where: {
				userId,
				logAt: date,
			},
		});
	}

	async findNutritionWithMealsByUserIdAndDate(userId: string, date: Date) {
		return await prisma.nutrition.findFirst({
			where: {
				userId,
				logAt: {
					gte: date,
					lte: new Date(date.getTime() + 24 * 60 * 60 * 1000),
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
	}

	async createNutrition(userId: string, logAt: Date, targetCal: any, targetFat: any, targetCarbs: any, targetProtein: any) {
		return await prisma.nutrition.create({
			data: {
				userId,
				logAt,
				targetCal: targetCal || 2500,
				targetFat: targetFat || 70,
				targetCarbs: targetCarbs || 275,
				targetProtein: targetProtein || 50,
			},
		});
	}

	async createMeal(nutritionId: string, name: string, image: string | null, description: string | null, cal: number, fat: number, protein: number, carbs: number) {
		return await prisma.meal.create({
			data: {
				nutritionId,
				name,
				image,
				description,
				cal,
				fat,
				protein,
				carbs,
			},
		});
	}
}

export const nutritionRepository = new NutritionRepository();

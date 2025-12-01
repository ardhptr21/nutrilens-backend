import z from "zod";

export type ScanModel = z.infer<typeof ScanSchema>;
export type MealUploadModel = z.infer<typeof MealUploadSchema>;
export type NutritionStatisticsModel = z.infer<typeof NutritionStatisticsSchema>;

export const ScanSchema = z.object({
	body: z.object({
		image: z
			.file()
			.max(1024 * 1024 * 5, "File size should be less than 5MB")
			.mime(["image/jpeg", "image/png"], "Only JPEG and PNG images are allowed"),
		detail: z.string().max(500).optional().nullable(),
	}),
});

export const MealUploadSchema = z.object({
	body: z.object({
		name: z.string().min(1),
		cal: z.coerce.number().min(0),
		fat: z.coerce.number().min(0),
		protein: z.coerce.number().min(0),
		carbs: z.coerce.number().min(0),
		description: z.string().optional().nullable(),
		image: z
			.file()
			.max(1024 * 1024 * 5, "File size should be less than 5MB")
			.mime(["image/jpeg", "image/png"], "Only JPEG and PNG images are allowed"),
	}),
});

export const NutritionStatisticsSchema = z.object({
	id: z.string(),
	date: z.date(),
	cal: z.number(),
	fat: z.number(),
	protein: z.number(),
	carbs: z.number(),
	targetCal: z.number(),
	targetFat: z.number(),
	targetCarbs: z.number(),
	targetProtein: z.number(),
	meals: z
		.array(
			z.object({
				id: z.string(),
				name: z.string(),
				image: z.string().nullable().optional(),
				description: z.string().nullable(),
				cal: z.number(),
				fat: z.number(),
				protein: z.number(),
				carbs: z.number(),
				createdAt: z.date(),
			}),
		)
		.optional(),
});

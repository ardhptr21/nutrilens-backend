import z from "zod";

export type ScanModel = z.infer<typeof ScanSchema>;
export type HistoryModel = z.infer<typeof HistorySchema>;

export const ScanSchema = z.object({
	body: z.object({
		image: z
			.file()
			.max(1024 * 1024 * 5, "File size should be less than 5MB")
			.mime(["image/jpeg", "image/png"], "Only JPEG and PNG images are allowed"),
		detail: z.string().max(500).optional().nullable(),
	}),
});

export const HistorySchema = z.object({
	id: z.string(),
	date: z.date(),
	totalCalories: z.number(),
	calorieGoal: z.number(),
	protein: z.number(),
	fat: z.number(),
	carbs: z.number(),
});


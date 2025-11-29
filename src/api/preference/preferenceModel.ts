import z from "zod";

export type UpdatePreferenceModel = z.infer<typeof UpdatePreferenceSchema>;

export const UpdatePreferenceSchema = z.object({
	targetCal: z.number().min(1000).max(50000),
	targetFat: z.number().min(0).max(10000),
	targetProtein: z.number().min(0).max(10000),
	targetCarbs: z.number().min(0).max(10000),
});

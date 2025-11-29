import z from "zod";

export type ScanModel = z.infer<typeof ScanSchema>;

export const ScanSchema = z.object({
	body: z.object({
		image: z
			.file()
			.max(1024 * 1024 * 5, "File size should be less than 5MB")
			.mime(["image/jpeg", "image/png"], "Only JPEG and PNG images are allowed"),
	}),
});

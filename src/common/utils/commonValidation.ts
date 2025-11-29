import { z } from "zod";

export const commonValidations = {
	id: z.string().regex(/^c[^\s-]{8,}$/, "Invalid ID format"),
};

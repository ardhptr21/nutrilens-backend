import { z } from "zod";
import { commonValidations } from "@/common/utils/commonValidation";

export type User = z.infer<typeof UserSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UserSchema = z.object({
	id: commonValidations.id,
	name: z.string(),
	email: z.string().email(),
	password: z.string().min(6),
	createdAt: z.date(),
	updatedAt: z.date(),
});
export const PublicUserSchema = UserSchema.omit({ password: true });

export const CreateUserSchema = UserSchema.pick({
	name: true,
	email: true,
	password: true,
});

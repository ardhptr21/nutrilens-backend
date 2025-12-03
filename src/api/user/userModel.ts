import { z } from "zod";
import { commonValidations } from "@/common/utils/commonValidation";
import { UpdatePreferenceSchema } from "../preference/preferenceModel";

export type User = z.infer<typeof UserSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
export type UpdateUserPreferenceModel = z.infer<typeof UpdateUserPreferenceSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUserModel = z.infer<typeof UpdateUserSchema>;

export const UserSchema = z.object({
	id: commonValidations.id,
	name: z.string(),
	email: z.email(),
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

export const UpdateUserPreferenceSchema = z.object({
	body: UpdatePreferenceSchema,
});

export const UpdateUserSchema = z.object({
	name: z.string(),
});

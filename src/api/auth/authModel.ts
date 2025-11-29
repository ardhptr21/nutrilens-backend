import z from "zod";
import { CreateUserSchema } from "../user/userModel";

export type Login = z.infer<typeof LoginSchema>;
export type Register = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
	body: z.object({
		email: z.string().email(),
		password: z.string().min(6),
	}),
});

export const RegisterSchema = z.object({
	body: CreateUserSchema,
});

import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { signToken } from "@/common/utils/jwt";
import { comparePasswordHash, hashPassword } from "@/common/utils/passwordHash";
import { preferenceRepository } from "../preference/preferenceRepository";
import { userRepository } from "../user/userRepository";
import type { LoginModel, RegisterModel } from "./authModel";

class AuthService {
	public async register(user: RegisterModel["body"]) {
		const exists = await userRepository.existsByEmail(user.email);
		if (exists) return ServiceResponse.failure("Email already in use", null, StatusCodes.CONFLICT);
		user.password = await hashPassword(user.password);
		const newUser = await userRepository.create(user);
		await preferenceRepository.create(newUser.id);
		const { password: _, ...userWithoutPassword } = newUser;
		return ServiceResponse.success("User registered successfully", userWithoutPassword, StatusCodes.CREATED);
	}

	public async login(data: LoginModel["body"]) {
		const user = await userRepository.findByEmail(data.email);
		if (!user) return ServiceResponse.failure("Invalid email or password", null, StatusCodes.UNAUTHORIZED);

		const isPasswordValid = await comparePasswordHash(data.password, user.password);
		if (!isPasswordValid) return ServiceResponse.failure("Invalid email or password", null, StatusCodes.UNAUTHORIZED);

		const token = signToken({ userId: user.id, email: user.email });
		return ServiceResponse.success("Login successful", { token }, StatusCodes.OK);
	}
}

export const authService = new AuthService();

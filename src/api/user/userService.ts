import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { UpdatePreferenceModel } from "../preference/preferenceModel";
import { preferenceRepository } from "../preference/preferenceRepository";
import type { UpdateUserModel } from "./userModel";
import { userRepository } from "./userRepository";

class UserService {
	async updateUser(userId: string, data: UpdateUserModel["body"]) {
		await userRepository.update(userId, data);
		return ServiceResponse.success("User updated successfully", null, StatusCodes.OK);
	}

	async getPreference(userId: string) {
		const preference = await preferenceRepository.findByUserId(userId);
		if (!preference) {
			return ServiceResponse.failure("Preference not found", null, StatusCodes.NOT_FOUND);
		}
		return ServiceResponse.success(
			"Preference retrieved successfully",
			{
				...preference,
				targetCal: Number(preference.targetCal),
				targetFat: Number(preference.targetFat),
				targetCarbs: Number(preference.targetCarbs),
				targetProtein: Number(preference.targetProtein),
			},
			StatusCodes.OK,
		);
	}

	async updatePreference(userId: string, preference: UpdatePreferenceModel) {
		await preferenceRepository.update(userId, preference);
		return ServiceResponse.success("Preference updated successfully", null, StatusCodes.OK);
	}
}

export const userService = new UserService();

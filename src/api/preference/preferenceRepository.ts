import { prisma } from "@/common/lib/prisma";
import type { UpdatePreferenceModel } from "./preferenceModel";

class PreferenceRepository {
	async create(userId: string) {
		return await prisma.preference.create({ data: { userId } });
	}

	async update(userId: string, preference: UpdatePreferenceModel) {
		return await prisma.preference.updateMany({
			where: { userId },
			data: preference,
		});
	}

	async findByUserId(userId: string) {
		return await prisma.preference.findFirst({
			where: { userId },
		});
	}
}

export const preferenceRepository = new PreferenceRepository();

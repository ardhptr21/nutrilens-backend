import type { CreateUser, User } from "@/api/user/userModel";
import { prisma } from "@/common/lib/prisma";

class UserRepository {
	async findByEmail(email: string): Promise<User | null> {
		return await prisma.user.findFirst({ where: { email } });
	}

	async findById(id: string): Promise<User | null> {
		return await prisma.user.findUnique({ where: { id } });
	}

	async existsByEmail(email: string): Promise<boolean> {
		const count = await prisma.user.count({ where: { email } });
		return count > 0;
	}

	async create(data: CreateUser): Promise<User> {
		return await prisma.user.create({ data });
	}
}

export const userRepository = new UserRepository();

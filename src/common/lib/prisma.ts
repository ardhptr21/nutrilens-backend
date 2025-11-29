import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "../utils/envConfig";

const adapter = new PrismaPg({
	connectionString: env.DATABASE_URL,
});
export const prisma = new PrismaClient({ adapter });

import bcrypt from "bcrypt";

export const hashPassword = async (password: string): Promise<string> => {
	const hashedPassword = await bcrypt.hash(password, 10);
	return hashedPassword;
};

export const comparePasswordHash = async (password: string, hash: string): Promise<boolean> => {
	return await bcrypt.compare(password, hash);
};

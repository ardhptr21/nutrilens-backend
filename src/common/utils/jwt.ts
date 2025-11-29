import * as jwt from "jsonwebtoken";
import type { JwtPayload } from "../../types/jwt.type";
import { env } from "./envConfig";

export const signToken = (payload: JwtPayload) => {
	return jwt.sign(
		payload,
		env.JWT_SECRET_KEY as string,
		{
			expiresIn: env.JWT_EXPIRES_IN,
		} as jwt.SignOptions,
	);
};

// make the type is success true then payload is JwtPayload, otherwise reason is string

type VerifyTokenSuccess = { success: true; payload: JwtPayload };
type VerifyTokenFailure = { success: false; reason: string };
type VerifyTokenResult = VerifyTokenSuccess | VerifyTokenFailure;

export const verifyToken = (token: string): VerifyTokenResult => {
	try {
		const payload = jwt.verify(token, env.JWT_SECRET_KEY as string) as JwtPayload;
		return { success: true, payload } as VerifyTokenSuccess;
	} catch (error) {
		let returned: VerifyTokenFailure = {
			success: false,
			reason: "Invalid token",
		};

		if (error instanceof jwt.TokenExpiredError) returned = { ...returned, reason: "Token expired" };
		return returned;
	}
};

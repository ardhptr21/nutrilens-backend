import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { userRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "../models/serviceResponse";
import { verifyToken } from "../utils/jwt";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
	const authorization = req.headers.authorization;
	if (!authorization || !authorization.startsWith("Bearer ")) {
		return ServiceResponse.failure("Unauthorized", null, StatusCodes.UNAUTHORIZED).send(res);
	}

	const token = authorization.split(" ")[1];
	const result = verifyToken(token);
	if (!result.success) {
		return ServiceResponse.failure("Unauthorized", null, StatusCodes.UNAUTHORIZED).send(res);
	}

	const user = await userRepository.findById(result.payload.userId);
	if (!user) {
		return ServiceResponse.failure("Unauthorized", null, StatusCodes.UNAUTHORIZED).send(res);
	}

	req.user = user;
	return next();
};

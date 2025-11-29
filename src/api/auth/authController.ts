import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { authService } from "./authService";

class AuthController {
	public register: RequestHandler = async (req, res) => {
		console.log(req.validated);
		const serviceResponse = await authService.register(req.validated.body);
		return serviceResponse.send(res);
	};

	public login: RequestHandler = async (req, res) => {
		const serviceResponse = await authService.login(req.validated.body);
		return serviceResponse.send(res);
	};

	public me: RequestHandler = async (req, res) => {
		return ServiceResponse.success("User info retrieved", req.user, StatusCodes.OK).send(res);
	};
}

export const authController = new AuthController();

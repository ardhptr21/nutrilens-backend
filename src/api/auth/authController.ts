import type { RequestHandler } from "express";
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
}

export const authController = new AuthController();

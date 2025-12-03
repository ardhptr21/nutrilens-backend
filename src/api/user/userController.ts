import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { userService } from "./userService";

class UserController {
	public me: RequestHandler = async (req, res) => {
		return ServiceResponse.success("User info retrieved", req.user, StatusCodes.OK).send(res);
	};

	public updateMe: RequestHandler = async (req, res) => {
		const serviceResponse = await userService.updateUser(req.user.id, req.validated.body);
		serviceResponse.send(res);
	};

	public getPreference: RequestHandler = async (req, res) => {
		const serviceResponse = await userService.getPreference(req.user.id);
		serviceResponse.send(res);
	};

	public updatePreference: RequestHandler = async (req, res) => {
		const serviceResponse = await userService.updatePreference(req.user.id, req.validated.body);
		serviceResponse.send(res);
	};
}

export const userController = new UserController();

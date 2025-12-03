import { Router } from "express";
import { auth } from "@/common/middleware/auth";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "./userController";
import { UpdateUserPreferenceSchema, UpdateUserSchema } from "./userModel";

export const userRouter: Router = Router();

userRouter
	.route("/me")
	.get(auth, userController.me)
	.patch(auth, validateRequest(UpdateUserSchema), userController.updateMe);

userRouter
	.route("/me/preference")
	.get(auth, userController.getPreference)
	.put(auth, validateRequest(UpdateUserPreferenceSchema), userController.updatePreference);

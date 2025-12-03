import { Router } from "express";
import { auth } from "@/common/middleware/auth";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "./userController";
import { UpdateUserPreferenceSchema } from "./userModel";

export const userRouter: Router = Router();

userRouter.get("/me", auth, userController.me);
userRouter
	.route("/me/preference")
	.get(auth, userController.getPreference)
	.put(auth, validateRequest(UpdateUserPreferenceSchema), userController.updatePreference);

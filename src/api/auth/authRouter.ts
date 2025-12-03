import { Router } from "express";
import { validateRequest } from "@/common/utils/httpHandlers";
import { authController } from "./authController";
import { LoginSchema, RegisterSchema } from "./authModel";

export const authRouter: Router = Router();

authRouter.post("/login", validateRequest(LoginSchema), authController.login);
authRouter.post("/register", validateRequest(RegisterSchema), authController.register);

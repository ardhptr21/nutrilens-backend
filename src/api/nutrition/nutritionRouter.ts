import { Router } from "express";
import { auth } from "@/common/middleware/auth";
import { acceptFiles, validateRequest } from "@/common/utils/httpHandlers";
import { nutritionController } from "./nutritionController";
import { ScanSchema } from "./nutritionModel";

export const nutritionRouter = Router();

nutritionRouter.post(
	"/scan",
	auth,
	acceptFiles([{ name: "image", maxCount: 1 }]),
	validateRequest(ScanSchema),
	nutritionController.scan,
);

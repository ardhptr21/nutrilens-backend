import { Router } from "express";
import { auth } from "@/common/middleware/auth";
import { acceptFiles, validateRequest } from "@/common/utils/httpHandlers";
import { nutritionController } from "./nutritionController";
import { MealUploadSchema, ScanSchema } from "./nutritionModel";

export const nutritionRouter: Router = Router();

nutritionRouter.post(
	"/scan",
	auth,
	acceptFiles([{ name: "image", maxCount: 1 }]),
	validateRequest(ScanSchema),
	nutritionController.scan,
);

nutritionRouter.post(
	"/meals",
	auth,
	acceptFiles([{ name: "image", maxCount: 1 }]),
	validateRequest(MealUploadSchema),
	nutritionController.uploadMeal,
);

nutritionRouter.get("/today", auth, nutritionController.getStatisticsToday);
nutritionRouter.get("/:date", auth, nutritionController.getStatistics);

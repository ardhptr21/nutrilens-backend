import { Router } from "express";
import { auth } from "@/common/middleware/auth";
import { acceptFiles, validateRequest } from "@/common/utils/httpHandlers";
import { nutritionController } from "./nutritionController";
import { ScanSchema, CreateMealSchema } from "./nutritionModel";

export const nutritionRouter = Router();

// Scan food from image
nutritionRouter.post(
	"/scan",
	auth,
	acceptFiles([{ name: "image", maxCount: 1 }]),
	validateRequest(ScanSchema),
	nutritionController.scan,
);

// Create meal manually for today
nutritionRouter.post(
	"/meals",
	auth,
	validateRequest(CreateMealSchema),
	nutritionController.createMeal,
);

// Get nutrition statistics for a specific date
nutritionRouter.get("/:date", auth, nutritionController.getStatistics);


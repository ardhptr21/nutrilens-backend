import type { RequestHandler } from "express";
import { nutritionService } from "./nutritionService";

class NutritionController {
	public scan: RequestHandler = async (req, res) => {
		const serviceResponse = await nutritionService.scan(req.validated.body);
		return serviceResponse.send(res);
	};
}

export const nutritionController = new NutritionController();

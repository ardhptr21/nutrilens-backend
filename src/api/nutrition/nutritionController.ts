import type { RequestHandler } from "express";
import { nutritionService } from "./nutritionService";

class NutritionController {
	public scan: RequestHandler = async (req, res) => {
		const serviceResponse = await nutritionService.scan(req.validated.body, req.user.id);
		return serviceResponse.send(res);
	};

	public createMeal: RequestHandler = async (req, res) => {
		const serviceResponse = await nutritionService.createMeal(req.validated.body, req.user.id);
		return serviceResponse.send(res);
	};

	public getStatistics: RequestHandler = async (req, res) => {
		const { date } = req.params;
		const parsedDate = new Date(date);

		if (isNaN(parsedDate.getTime())) {
			return res.status(400).json({
				success: false,
				message: "Invalid date format. Use YYYY-MM-DD",
				statusCode: 400,
			});
		}

		const serviceResponse = await nutritionService.getStatistics(req.user.id, parsedDate);
		return serviceResponse.send(res);
	};
}

export const nutritionController = new NutritionController();


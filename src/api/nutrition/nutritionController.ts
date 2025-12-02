import type { RequestHandler } from "express";
import { nutritionService } from "./nutritionService";

class NutritionController {
  public scan: RequestHandler = async (req, res) => {
    const serviceResponse = await nutritionService.scan(req.validated.body);
    return serviceResponse.send(res);
  };

  public uploadMeal: RequestHandler = async (req, res) => {
    const serviceResponse = await nutritionService.uploadMeal(
      req.validated.body,
      req.user.id
    );
    return serviceResponse.send(res);
  };

  public getStatistics: RequestHandler = async (req, res) => {
    const { date } = req.params;
    // Parse date as UTC midnight (YYYY-MM-DD format)
    const [year, month, day] = date.split("-").map(Number);
    const parsedDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
        statusCode: 400,
      });
    }

    const serviceResponse = await nutritionService.getStatistics(
      req.user.id,
      parsedDate
    );
    return serviceResponse.send(res);
  };

  public getStatisticsToday: RequestHandler = async (req, res) => {
    const serviceResponse = await nutritionService.getStatisticsToday(
      req.user.id
    );
    return serviceResponse.send(res);
  };
}

export const nutritionController = new NutritionController();

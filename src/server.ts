import cors from "cors";
import express, { type Express } from "express";
import { pino } from "pino";
import errorHandler from "@/common/middleware/errorHandler";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";

import { authRouter } from "./api/auth/authRouter";
import { healthCheckRouter } from "./api/healthCheck/healthCheckRouter";
import { nutritionRouter } from "./api/nutrition/nutritionRouter";
import { userRouter } from "./api/user/userRouter";

const logger = pino({ name: "server start" });
const app: Express = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/nutrition", nutritionRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };

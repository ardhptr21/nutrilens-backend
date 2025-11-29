import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { Field } from "multer";
import multer from "multer";
import type { ZodError, ZodSchema } from "zod";
import { ServiceResponse } from "@/common/models/serviceResponse";

const multerToFile = (file: Express.Multer.File): File => {
	return new File([new Uint8Array(file.buffer)], file.originalname, {
		type: file.mimetype,
		lastModified: Date.now(),
	});
};

export const validateRequest = (schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
	if (req.files) {
		const files = req.files as { [fieldname: string]: Express.Multer.File[] };
		for (const fieldname in files) {
			const fileArray = files[fieldname];
			req.body[fieldname] = fileArray.length === 1 ? multerToFile(fileArray[0]) : fileArray.map(multerToFile);
		}
	}

	try {
		const result = (await schema.parseAsync({
			body: req.body,
			query: req.query,
			params: req.params,
		})) as {
			body: any;
			query: any;
			params: any;
		};

		req.validated = result;
		next();
	} catch (err) {
		const zodErr = err as ZodError;

		const errors = zodErr.issues.map((issue) => {
			const path = issue.path.length > 0 ? issue.path.join(".") : "root";
			return `${path}: ${issue.message}`;
		});

		const errorMessage =
			errors.length === 1
				? `Invalid input: ${errors[0]}`
				: `Invalid input (${errors.length} errors): ${errors.join("; ")}`;

		const serviceResponse = ServiceResponse.failure(errorMessage, null, StatusCodes.BAD_REQUEST);

		res.status(serviceResponse.statusCode).send(serviceResponse);
	}
};

export const acceptFiles = (fields: Field[]) => {
	const upload = multer({ storage: multer.memoryStorage() });
	return upload.fields(fields);
};

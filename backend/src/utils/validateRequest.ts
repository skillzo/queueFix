import z from "zod";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "./serviceResponse";

export const requestValidation = (schema: z.ZodSchema, data: any) => {
  const validation = schema.safeParse(data);
  if (!validation.success) {
    const errors = validation.error.issues.map((error) => {
      const fieldPath = error.path.join(".");
      return `${fieldPath}: ${error.message}`;
    });

    return ServiceResponse.failure(
      errors.join(", "),
      undefined,
      StatusCodes.BAD_REQUEST
    );
  }

  return { success: true, errors: null };
};

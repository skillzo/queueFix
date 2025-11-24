import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export class ServiceResponse<T = null> {
  readonly success: boolean;
  readonly message: string;
  readonly data: T;
  readonly statusCode: number;
  readonly error: Error | undefined;

  private constructor(
    success: boolean,
    message: string,
    data: T,
    statusCode: number,
    error?: Error
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
    this.error = error ?? undefined;
  }

  static success<T = null>(
    message: string,
    data?: T,
    statusCode: number = StatusCodes.OK
  ): ServiceResponse<T> {
    return new ServiceResponse(true, message, data as T, statusCode);
  }

  static failure<T = null>(
    message: string,
    error?: Error,
    statusCode: number = StatusCodes.BAD_REQUEST
  ): ServiceResponse<T> {
    return new ServiceResponse(
      false,
      message,
      undefined as T,
      statusCode,
      error
    );
  }
}

export const ServiceResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: dataSchema.optional(),
    statusCode: z.number(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        field: z.string().optional(),
      })
      .optional(),
  });

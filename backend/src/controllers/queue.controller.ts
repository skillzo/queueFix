import z from "zod";
import { Request, Response } from "express";
import { QueueService } from "../service/queue.service";
import { ServiceResponse } from "../utils/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { requestValidation } from "../utils/validateRequest";

const JoinQueueSchema = z.object({
  phoneNumber: z.string().min(10).max(15),
  fullName: z.string().min(1),
});

const JoinQueueManySchema = z.object({
  users: z
    .array(
      z.object({
        phoneNumber: z.string().min(10).max(15),
        fullName: z.string().min(1),
      })
    )
    .min(1)
    .max(100), // Limit to 50 users per request
});

export class QueueController {
  private queueService: QueueService;

  constructor() {
    this.queueService = new QueueService();
  }

  async joinQueue(req: Request, res: Response) {
    const { companyId } = req.params;
    const data = req.body;

    try {
      const validationResponse = requestValidation(JoinQueueSchema, data);
      if (!validationResponse.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(validationResponse);
      }

      const response = await this.queueService.joinQueue(companyId, data);
      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Error joining queue:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          ServiceResponse.failure(
            "Failed to join queue",
            error as Error,
            StatusCodes.INTERNAL_SERVER_ERROR
          )
        );
    }
  }

  async joinQueueMany(req: Request, res: Response) {
    const { companyId } = req.params;
    const data = req.body;

    try {
      const validationResponse = requestValidation(JoinQueueManySchema, data);
      if (!validationResponse.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(validationResponse);
      }

      const response = await this.queueService.joinQueueMany(
        companyId,
        data.users
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Error joining queue (many):", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          ServiceResponse.failure(
            "Failed to join queue",
            error as Error,
            StatusCodes.INTERNAL_SERVER_ERROR
          )
        );
    }
  }

  async getPosition(req: Request, res: Response) {
    const { companyId } = req.params;
    const { phoneNumber } = req.query;

    try {
      if (!phoneNumber || typeof phoneNumber !== "string") {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(
            ServiceResponse.failure(
              "Phone number is required",
              undefined,
              StatusCodes.BAD_REQUEST
            )
          );
      }

      const response = await this.queueService.getPosition(
        phoneNumber,
        companyId
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Error getting position:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          ServiceResponse.failure(
            "Failed to get position",
            error as Error,
            StatusCodes.INTERNAL_SERVER_ERROR
          )
        );
    }
  }

  async getQueueStatus(req: Request, res: Response) {
    const { companyId } = req.params;

    try {
      const response = await this.queueService.getQueueStatus(companyId);
      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Error getting queue status:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          ServiceResponse.failure(
            "Failed to get queue status",
            error as Error,
            StatusCodes.INTERNAL_SERVER_ERROR
          )
        );
    }
  }

  async nextCustomer(req: Request, res: Response) {
    const { companyId } = req.params;

    try {
      const response = await this.queueService.nextCustomer(companyId);
      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Error serving next customer:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          ServiceResponse.failure(
            "Failed to serve next customer",
            error as Error,
            StatusCodes.INTERNAL_SERVER_ERROR
          )
        );
    }
  }

  async leaveQueue(req: Request, res: Response) {
    const { companyId } = req.params;
    const { phoneNumber } = req.query;

    try {
      if (!phoneNumber || typeof phoneNumber !== "string") {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(
            ServiceResponse.failure(
              "Phone number is required",
              undefined,
              StatusCodes.BAD_REQUEST
            )
          );
      }

      const response = await this.queueService.leaveQueue(
        phoneNumber,
        companyId
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Error leaving queue:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          ServiceResponse.failure(
            "Failed to leave queue",
            error as Error,
            StatusCodes.INTERNAL_SERVER_ERROR
          )
        );
    }
  }

  async getQueueList(req: Request, res: Response) {
    const { companyId } = req.params;
    const { limit } = req.query;

    try {
      const response = await this.queueService.getQueueList(
        companyId,
        limit ? Number(limit) : undefined
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Error getting queue list:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          ServiceResponse.failure(
            "Failed to get queue list",
            error as Error,
            StatusCodes.INTERNAL_SERVER_ERROR
          )
        );
    }
  }
}

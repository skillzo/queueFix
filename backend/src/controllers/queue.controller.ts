import z from "zod";
import { Request, Response } from "express";
import { QueueService } from "../service/queue.service";
import { ServiceResponse } from "../utils/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { requestValidation } from "../utils/validateRequest";

const JoinQueueSchema = z.object({
  userId: z.uuid().optional(),
  phoneNumber: z.string().min(1),
  fullName: z.string().min(1),
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

      // Ensure at least userId or phoneNumber is provided
      if (!data.userId && !data.phoneNumber) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(
            ServiceResponse.failure(
              "Either userId or phoneNumber must be provided",
              undefined,
              StatusCodes.BAD_REQUEST
            )
          );
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

  async getPosition(req: Request, res: Response) {
    const { companyId, userId } = req.params;

    try {
      if (!userId) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(
            ServiceResponse.failure(
              "UserId is required",
              undefined,
              StatusCodes.BAD_REQUEST
            )
          );
      }

      const response = await this.queueService.getPosition(userId, companyId);
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
    const { companyId, userId } = req.params;

    try {
      if (!userId) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(
            ServiceResponse.failure(
              "UserId is required",
              undefined,
              StatusCodes.BAD_REQUEST
            )
          );
      }

      const response = await this.queueService.leaveQueue(userId, companyId);
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

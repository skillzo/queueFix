import z from "zod";
import { Request, Response } from "express";
import { CompanyService } from "../service/company.service";
import { ServiceResponse } from "../utils/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { requestValidation } from "../utils/validateRequest";
import { CompanyCategoryEnum } from "../entities/company.entity";

const CreateCompanySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(CompanyCategoryEnum),
  imageUrl: z.url(),
  address: z.string().min(1),
  longitude: z.number(),
  latitude: z.number(),
  hours: z.object({
    weekdays: z.string().min(1),
    weekends: z.string().min(1),
  }),
  phoneNumber: z.string().min(1),
  serviceTimeMinutes: z.number().min(1),
  maxQueueCapacity: z.number().min(1),
  queuePrefix: z.string().min(1),
});

export class CompanyController {
  private companyService: CompanyService;

  constructor() {
    this.companyService = new CompanyService();
  }

  async createCompany(req: Request, res: Response) {
    const data = req.body;
    try {
      const validationResponse = requestValidation(CreateCompanySchema, data);
      if (!validationResponse.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(validationResponse);
      }

      const response = await this.companyService.createCompany(data);
      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Error creating company", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          ServiceResponse.failure(
            "Failed to create company",
            error as Error,
            StatusCodes.INTERNAL_SERVER_ERROR
          )
        );
    }
  }

  async getAllCompanies(req: Request, res: Response) {
    const { page, pageSize, search, category } = req.query;
    try {
      const response = await this.companyService.getAllCompanies(
        Number(page) || 1,
        Number(pageSize) || 10,
        search as string,
        category as string
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Error fetching companies", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          ServiceResponse.failure(
            "Failed to fetch companies",
            error as Error,
            StatusCodes.INTERNAL_SERVER_ERROR
          )
        );
    }
  }

  async getCompanyById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const response = await this.companyService.getCompanyById(id);
      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Error fetching company", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          ServiceResponse.failure(
            "Failed to fetch company",
            error as Error,
            StatusCodes.INTERNAL_SERVER_ERROR
          )
        );
    }
  }
}

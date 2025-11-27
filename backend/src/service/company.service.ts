import { ILike, IsNull, Repository } from "typeorm";
import { Company } from "../entities/company.entity";
import { AppDataSource } from "../data-source";
import { ServiceResponse } from "../utils/serviceResponse";
import { StatusCodes } from "http-status-codes";
import {
  createPaginatedResponse,
  PaginatedResponse,
} from "../utils/createPaginatedResponse";

export class CompanyService {
  private companyRepository: Repository<Company>;

  constructor() {
    this.companyRepository = AppDataSource.getRepository(Company);
  }

  async createCompany(company: Company) {
    try {
      const companyExists = await this.companyRepository.findOne({
        where: {
          name: company.name,
          phoneNumber: company.phoneNumber,
          longitude: company.longitude,
          latitude: company.latitude,
        },
      });

      if (companyExists) {
        return ServiceResponse.failure(
          "Company already exists",
          undefined,
          StatusCodes.BAD_REQUEST
        );
      }

      const newCompany = this.companyRepository.create(company);

      await this.companyRepository.save(newCompany);

      return ServiceResponse.success(
        "Company created successfully",
        newCompany,
        StatusCodes.CREATED
      );
    } catch (error) {
      console.error("Error creating company", error);
      return ServiceResponse.failure(
        "Failed to create company",
        error as Error,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllCompanies(
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string
  ): Promise<ServiceResponse<PaginatedResponse<Company>>> {
    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;
    const skip = (pageNumber - 1) * limit;

    try {
      // build base query
      const qb = this.companyRepository
        .createQueryBuilder("company")
        .select([
          "company.id",
          "company.name",
          "company.description",
          "company.category",
          "company.imageUrl",
          "company.address",
          "company.latitude",
          "company.longitude",
          "company.phoneNumber",
          "company.hours",
          "company.serviceTimeMinutes",
          "company.maxQueueCapacity",
        ])
        .where("company.deletedAt IS NULL")
        .orderBy("company.createdAt", "DESC");

      if (search?.trim()) {
        qb.andWhere(
          "(company.name ILIKE :search OR company.description ILIKE :search)",
          { search: `%${search?.trim()}%` }
        );
      }

      if (category?.trim()) {
        qb.andWhere("company.category = :category", { category });
      }

      const [companies, total] = await qb
        .skip(skip)
        .take(pageSize)
        .getManyAndCount();

      const paginatedResponse = createPaginatedResponse(
        companies,
        total,
        skip,
        pageSize
      );

      return ServiceResponse.success(
        "Companies fetched successfully",
        paginatedResponse,
        StatusCodes.OK
      );
    } catch (error) {
      return ServiceResponse.failure(
        "Failed to fetch companies",
        error as Error,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCompanyById(id: string): Promise<ServiceResponse<Company>> {
    const company = await this.companyRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
      select: [
        "id",
        "name",
        "description",
        "category",
        "imageUrl",
        "address",
        "latitude",
        "longitude",
        "phoneNumber",
        "hours",
      ],
    });

    if (!company) {
      return ServiceResponse.failure(
        "Company not found",
        undefined,
        StatusCodes.NOT_FOUND
      );
    }

    return ServiceResponse.success(
      "Company fetched successfully",
      company,
      StatusCodes.OK
    );
  }

  private buildBaseQuery() {
    return this.companyRepository
      .createQueryBuilder("company")
      .where("company.deletedAt IS NULL");
  }
}

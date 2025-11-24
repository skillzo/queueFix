import { ILike, IsNull, Repository } from "typeorm";
import { Company } from "../entities/company.entity";
import { AppDataSource } from "../data-source";
import { ServiceResponse } from "../utils/serviceResponse";
import { StatusCodes } from "http-status-codes";

export class CompanyService {
  private companyRepository: Repository<Company>;

  constructor() {
    this.companyRepository = AppDataSource.getRepository(Company);
  }

  async createCompany(company: Company) {
    const companyExists = await this.companyRepository.findOne({
      where: {
        name: company.name,
        phoneNumber: company.phoneNumber,
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
  }

  async getAllCompanies(): Promise<Company[]> {
    return this.companyRepository.find({
      where: {
        deletedAt: IsNull(),
      },
      order: {
        createdAt: "DESC",
      },
    });
  }

  async getCompanyById(id: string): Promise<Company | null> {
    return this.companyRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
  }
}

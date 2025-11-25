import { Router } from "express";
import { CompanyController } from "../controllers/company.controller";

const router = Router();
const companyController = new CompanyController();

router.post("/", companyController.createCompany.bind(companyController));
router.get("/", companyController.getAllCompanies.bind(companyController));
router.get("/:id", companyController.getCompanyById.bind(companyController));

export default router;

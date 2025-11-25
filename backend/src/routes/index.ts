import { Express } from "express";
import companyRouter from "./company.route";
import queueRouter from "./queue.route";

export const registerRoutes = (app: Express): void => {
  app.use("/api/v1/companies", companyRouter);
  app.use("/api/v1/queues", queueRouter);
};

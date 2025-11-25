import "reflect-metadata";
import { DataSource } from "typeorm";
import { ENV } from "./config/ENV";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: ENV.DB.HOST,
  port: parseInt(ENV.DB.PORT as string),
  username: ENV.DB.USERNAME,
  password: ENV.DB.PASSWORD,
  database: ENV.DB.NAME,
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
});

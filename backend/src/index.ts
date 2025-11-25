import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import { registerRoutes } from "./routes";
import { redisService } from "./service/redis.service";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

registerRoutes(app);

app.get("/", (req, res) => {
  res.json({ message: "QueueFix API" });
});

async function initializeServices() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");

    // Initialize Redis
    await redisService.connect();
    console.log("Redis connected");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error initializing services:", error);
    process.exit(1);
  }
}

initializeServices();

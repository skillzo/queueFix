import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import { registerRoutes } from "./routes";
import { redisService } from "./service/redis.service";
import cors from "cors";
import { ENV } from "./config/ENV";
import { createServer } from "http";
import { queueSocketService } from "./websocket/queue.socket";

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
  cors({
    origin: ENV.APP.FRONTEND_URL,
    credentials: true,
  })
);
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

    queueSocketService.initialize(server);
    console.log("WebSocket server initialized");

    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error initializing services:", error);
    process.exit(1);
  }
}

initializeServices();

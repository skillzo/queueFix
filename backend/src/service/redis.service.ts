import { createClient, RedisClientType } from "redis";
import { ENV } from "../config/ENV";

export class RedisService {
  private client: RedisClientType;
  private static instance: RedisService;
  private isConnected: boolean = false;

  private constructor() {
    this.client = createClient({
      socket: {
        host: ENV.REDIS.HOST,
        port: ENV.REDIS.PORT,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error("Redis: Too many reconnection attempts");
            return new Error("Too many reconnection attempts");
          }
          return Math.min(retries * 100, 3000);
        },
      },
      password: ENV.REDIS.PASSWORD,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on("error", (err) => {
      console.error("Redis Client Error:", err);
      this.isConnected = false;
    });

    this.client.on("connect", () => {
      console.log("Redis: Connecting...");
    });

    this.client.on("ready", () => {
      console.log("Redis: Connected and ready");
      this.isConnected = true;
    });

    this.client.on("end", () => {
      console.log("Redis: Connection closed");
      this.isConnected = false;
    });

    this.client.on("reconnecting", () => {
      console.log("Redis: Reconnecting...");
    });
  }

  // Singleton pattern
  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  async connect(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.client.connect();
      }
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.quit();
        this.isConnected = false;
      }
    } catch (error) {
      console.error("Error disconnecting Redis:", error);
      throw error;
    }
  }

  getClient(): RedisClientType {
    if (!this.isConnected) {
      throw new Error("Redis client is not connected");
    }
    return this.client;
  }

  isClientConnected(): boolean {
    return this.isConnected;
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      const pong = await this.client.ping();
      return pong === "PONG";
    } catch (error) {
      console.error("Redis health check failed:", error);
      return false;
    }
  }

  // Helper methods for key generation
  getQueueListKey(companyId: string): string {
    return `queue:${companyId}:list`;
  }

  getQueueServingKey(companyId: string): string {
    return `queue:${companyId}:serving`;
  }

  getQueueCounterKey(companyId: string): string {
    return `queue:${companyId}:counter`;
  }

  getQueueEntryKey(userId: string, companyId: string): string {
    return `queue:entry:${userId}:${companyId}`;
  }
}

// Export singleton instance
export const redisService = RedisService.getInstance();

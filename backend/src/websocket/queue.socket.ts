import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { ENV } from "../config/ENV";

export class QueueSocketService {
  private io: SocketIOServer | null = null;
  private static instance: QueueSocketService;

  private constructor() {}

  static getInstance(): QueueSocketService {
    if (!QueueSocketService.instance) {
      QueueSocketService.instance = new QueueSocketService();
    }
    return QueueSocketService.instance;
  }

  initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: ENV.APP.FRONTEND_URL,
        credentials: true,
      },
    });

    this.setupEventHandlers();
    console.log("Queue socket initialized");
  }

  // Method to broadcast from anywhere in your app
  broadcastQueueUpdate(companyId: string, data: any) {
    this.io?.to(`queue:${companyId}`).emit("queue-updated", data);
  }

  emitQueueUpdate(companyId: string, data: any): void {
    if (!this.io) {
      console.warn("WebSocket not initialized");
      return;
    }
    this.io.to(`queue:${companyId}`).emit("queue-updated", data);
  }

  emitToUser(userId: string, event: string, data: any): void {
    if (!this.io) {
      console.warn("WebSocket not initialized");
      return;
    }
    this.io.to(`user:${userId}`).emit(event, data);
  }

  getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error("WebSocket not initialized");
    }
    return this.io;
  }

  isInitialized(): boolean {
    return this.io !== null;
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on("test-connection", () => {
        console.log(`Socket ${socket.id} tested connection`);
        socket.emit("test-response", "test response here");
      });

      socket.on("join-queue-room", (companyId: string) => {
        socket.join(`queue:${companyId}`);

        console.log(`Socket ${socket.id} joined queue:${companyId}`);
      });

      socket.on("leave-queue-room", (companyId: string) => {
        socket.leave(`queue:${companyId}`);
        console.log(`Socket ${socket.id} left queue:${companyId}`);
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }
}

export const queueSocketService = QueueSocketService.getInstance();

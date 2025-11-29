import { AppDataSource } from "../data-source";
import { QueueEntry, QueueEntryStatus } from "../entities/queueEntry.entity";
import {
  dbWriteQueueService,
  DBWriteJob,
  DBWriteType,
} from "./db-write-queue.service";
import { In, Repository } from "typeorm";

export class DBWriteWorkerService {
  private static instance: DBWriteWorkerService;
  private queueEntryRepository: Repository<QueueEntry>;
  private isRunning: boolean = false;
  private processInterval: NodeJS.Timeout | null = null;
  private readonly PROCESS_INTERVAL_MS = 2000; // Process every 2 seconds
  private readonly BATCH_SIZE = 10;

  private constructor() {
    this.queueEntryRepository = AppDataSource.getRepository(QueueEntry);
  }

  static getInstance(): DBWriteWorkerService {
    if (!DBWriteWorkerService.instance) {
      DBWriteWorkerService.instance = new DBWriteWorkerService();
    }
    return DBWriteWorkerService.instance;
  }

  /**
   * Start the background worker
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("[DB Write Worker] Already running");
      return;
    }

    this.isRunning = true;
    console.log("[DB Write Worker] Starting background worker...");

    // Process jobs periodically
    this.processInterval = setInterval(() => {
      this.processJobs().catch((error) => {
        console.error("[DB Write Worker] Error in process loop:", error);
      });
    }, this.PROCESS_INTERVAL_MS);

    // Process immediately
    this.processJobs().catch((error) => {
      console.error("[DB Write Worker] Error in initial process:", error);
    });
  }

  /**
   * Stop the background worker
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
    console.log("[DB Write Worker] Stopped");
  }

  /**
   * Process jobs from the queue
   */
  private async processJobs(): Promise<void> {
    if (!this.isRunning) return;

    try {
      // Pop batch of jobs
      const jobs = await dbWriteQueueService.popBatch(this.BATCH_SIZE);
      if (jobs.length === 0) return;

      // Group by type for batch processing
      const completeJobs = jobs.filter(
        (j) => j.type === DBWriteType.COMPLETE_ENTRY
      );
      const leaveJobs = jobs.filter((j) => j.type === DBWriteType.LEAVE_ENTRY);

      // Process complete jobs in batch
      if (completeJobs.length > 0) {
        const entryIds = completeJobs.map((j) => j.entryId);
        await this.queueEntryRepository.update(
          { id: In(entryIds) },
          {
            status: QueueEntryStatus.COMPLETED,
            completedAt: new Date(),
          }
        );
      }

      // Process leave jobs in batch
      if (leaveJobs.length > 0) {
        const entryIds = leaveJobs.map((j) => j.entryId);
        await this.queueEntryRepository.update(
          { id: In(entryIds) },
          {
            status: QueueEntryStatus.LEFT,
            leftAt: new Date(),
          }
        );
      }

      console.log(
        `[DB Write Worker] Processed ${jobs.length} jobs (${completeJobs.length} completed, ${leaveJobs.length} left)`
      );
    } catch (error) {
      console.error("[DB Write Worker] Error processing jobs:", error);
    }
  }
}

export const dbWriteWorkerService = DBWriteWorkerService.getInstance();

import { redisService } from "./redis.service";

export enum DBWriteType {
  COMPLETE_ENTRY = "COMPLETE_ENTRY",
  LEAVE_ENTRY = "LEAVE_ENTRY",
}

export interface DBWriteJob {
  type: DBWriteType;
  entryId: string;
  companyId: string;
  data: {
    status: string;
    completedAt?: string;
    leftAt?: string;
  };
}

export class DBWriteQueueService {
  private static instance: DBWriteQueueService;
  private readonly QUEUE_KEY = "db-write-queue";

  private constructor() {}

  static getInstance(): DBWriteQueueService {
    if (!DBWriteQueueService.instance) {
      DBWriteQueueService.instance = new DBWriteQueueService();
    }
    return DBWriteQueueService.instance;
  }

  /**
   * Enqueue a DB write job (simple push to Redis list)
   */
  async enqueue(job: DBWriteJob): Promise<void> {
    try {
      const client = redisService.getClient();
      await client.rPush(this.QUEUE_KEY, JSON.stringify(job));
    } catch (error) {
      console.error("Error enqueueing DB write job:", error);
      throw error;
    }
  }

  /**
   * Pop jobs from queue (returns null if empty)
   */
  async pop(): Promise<DBWriteJob | null> {
    try {
      const client = redisService.getClient();
      const jobStr = await client.lPop(this.QUEUE_KEY);
      if (!jobStr) return null;
      return JSON.parse(jobStr) as DBWriteJob;
    } catch (error) {
      console.error("Error popping job:", error);
      return null;
    }
  }

  /**
   * Pop multiple jobs (up to count)
   */
  async popBatch(count: number): Promise<DBWriteJob[]> {
    const jobs: DBWriteJob[] = [];
    for (let i = 0; i < count; i++) {
      const job = await this.pop();
      if (!job) break;
      jobs.push(job);
    }
    return jobs;
  }
}

export const dbWriteQueueService = DBWriteQueueService.getInstance();

import * as cron from "node-cron";
import { QueueService } from "./queue.service";
import { CompanyService } from "./company.service";
import { redisService } from "./redis.service";

export class QueueCronService {
  private queueService: QueueService;
  private companyService: CompanyService;
  private activeJobs: Map<string, cron.ScheduledTask> = new Map();
  private static instance: QueueCronService;

  private constructor() {
    this.queueService = new QueueService();
    this.companyService = new CompanyService();
  }

  static getInstance(): QueueCronService {
    if (!QueueCronService.instance) {
      QueueCronService.instance = new QueueCronService();
    }
    return QueueCronService.instance;
  }

  startAutopilot(companyId: string): boolean {
    if (this.activeJobs.has(companyId)) {
      console.log(`[Autopilot] Already running for company ${companyId}`);
      return false;
    }

    const task = cron.schedule("*/3 * * * * *", async () => {
      await this.processQueue(companyId);
    });

    this.activeJobs.set(companyId, task);
    console.log(`[Autopilot] Started for company ${companyId}`);
    return true;
  }

  stopAutopilot(companyId: string): boolean {
    const task = this.activeJobs.get(companyId);
    if (!task) {
      console.log(`[Autopilot] Not running for company ${companyId}`);
      return false;
    }

    task.stop();
    this.activeJobs.delete(companyId);
    console.log(`[Autopilot] Stopped for company ${companyId}`);
    return true;
  }

  isAutopilotActive(companyId: string): boolean {
    return this.activeJobs.has(companyId);
  }

  private async processQueue(companyId: string): Promise<void> {
    try {
      const client = redisService.getClient();
      const queueListKey = redisService.getQueueListKey(companyId);
      const queueSize = await client.lLen(queueListKey);

      // If queue is empty, stop autopilot
      if (queueSize === 0) {
        console.log(
          `[Autopilot] Queue empty for company ${companyId}, stopping autopilot`
        );
        this.stopAutopilot(companyId);
        return;
      }

      // Call nextCustomer for this company
      const result = await this.queueService.nextCustomer(companyId);

      if (result.success) {
        console.log(
          `[Autopilot] Processed next customer for company ${companyId}`
        );
      } else {
        console.log(
          `[Autopilot] No customer to process for company ${companyId}: ${result.message}`
        );
        // If no customer to process and queue is empty, stop autopilot
        const currentQueueSize = await client.lLen(queueListKey);
        if (currentQueueSize === 0) {
          console.log(
            `[Autopilot] Queue empty after processing, stopping autopilot for company ${companyId}`
          );
          this.stopAutopilot(companyId);
        }
      }
    } catch (error) {
      console.error(
        `[Autopilot] Error processing queue for company ${companyId}:`,
        error
      );
    }
  }
}

export const queueCronService = QueueCronService.getInstance();

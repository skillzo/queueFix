import { In, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { QueueEntry, QueueEntryStatus } from "../entities/queueEntry.entity";
import { Company } from "../entities/company.entity";
import { redisService } from "./redis.service";
import { ServiceResponse } from "../utils/serviceResponse";
import { StatusCodes } from "http-status-codes";

interface JoinQueueData {
  userId?: string;
  phoneNumber?: string;
  fullName: string;
}

interface QueuePosition {
  position: number;
  peopleAhead: number;
  queueNumber: string;
  estimatedWaitMinutes: number;
}

interface QueueStatus {
  currentServing: number;
  queueSize: number;
  estimatedWaitMinutes: number;
  isFull: boolean;
}

interface QueueListEntry {
  queueNumber: string;
  fullName: string;
  position: number;
  phoneNumber?: string;
}

export class QueueService {
  private queueEntryRepository: Repository<QueueEntry>;
  private companyRepository: Repository<Company>;

  constructor() {
    this.queueEntryRepository = AppDataSource.getRepository(QueueEntry);
    this.companyRepository = AppDataSource.getRepository(Company);
  }

  async joinQueue(
    companyId: string,
    userData: JoinQueueData
  ): Promise<ServiceResponse<QueueEntry & { position: number }>> {
    try {
      const client = redisService.getClient();

      const company = await this.companyRepository.findOne({
        where: { id: companyId },
      });

      if (!company) {
        return ServiceResponse.failure(
          "Company not found",
          undefined,
          StatusCodes.NOT_FOUND
        );
      }

      // Check if user already in queue (by phoneNumber or userId)
      if (userData.phoneNumber) {
        const existingEntry = await this.queueEntryRepository.findOne({
          where: {
            companyId,
            phoneNumber: userData.phoneNumber,
            status: QueueEntryStatus.WAITING,
          },
        });

        if (existingEntry) {
          const position = await this.getPositionFromRedis(
            companyId,
            existingEntry.id
          );

          return ServiceResponse.success(
            "You are already in the queue",
            { ...existingEntry, position: position },
            StatusCodes.OK
          );
        }
      }

      // Check queue capacity
      const queueListKey = redisService.getQueueListKey(companyId);
      const queueSize = await client.lLen(queueListKey);
      const maxCapacity = company.maxQueueCapacity || 100;

      if (queueSize >= maxCapacity) {
        return ServiceResponse.failure(
          "Queue is full",
          undefined,
          StatusCodes.BAD_REQUEST
        );
      }

      const queueNumber = await this.generateQueueNumber(companyId);
      const position = queueSize + 1;

      // Create QueueEntry in PostgreSQL
      const queueEntry = this.queueEntryRepository.create({
        companyId,
        userId: userData.userId,
        phoneNumber: userData.phoneNumber,
        fullName: userData.fullName,
        queueNumber,
        position,
        status: QueueEntryStatus.WAITING,
      });

      const savedEntry = await this.queueEntryRepository.save(queueEntry);

      // Add to Redis list (right push to maintain order)
      await client.rPush(queueListKey, savedEntry.id);

      // Store entry details in Redis hash
      const entryKey = redisService.getQueueEntryKey(savedEntry.id, companyId);
      await client.hSet(entryKey, {
        id: savedEntry.id,
        queueNumber: savedEntry.queueNumber,
        fullName: savedEntry.fullName,
        phoneNumber: savedEntry.phoneNumber || "",
        position: savedEntry.position.toString(),
      });

      // Set expiration on hash (24 hours)
      await client.expire(entryKey, 86400);

      return ServiceResponse.success(
        "Successfully joined queue",
        { ...savedEntry, position: savedEntry.position },
        StatusCodes.CREATED
      );
    } catch (error) {
      console.error("Error joining queue:", error);
      return ServiceResponse.failure(
        "Failed to join queue",
        error as Error,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getPosition(
    userId: string,
    companyId: string
  ): Promise<ServiceResponse<QueuePosition>> {
    try {
      const client = redisService.getClient();

      // Find queue entry
      const entry = await this.queueEntryRepository.findOne({
        where: {
          companyId,
          userId,
          status: QueueEntryStatus.WAITING,
        },
      });

      if (!entry) {
        return ServiceResponse.failure(
          "You are not in the queue",
          undefined,
          StatusCodes.NOT_FOUND
        );
      }

      // Get position from Redis
      const position = await this.getPositionFromRedis(companyId, entry.id);

      // Get current serving number
      const servingKey = redisService.getQueueServingKey(companyId);
      const currentServing = parseInt((await client.get(servingKey)) || "0");

      const peopleAhead = Math.max(0, position - currentServing);

      // Get company for service time
      const company = await this.companyRepository.findOne({
        where: { id: companyId },
      });
      const serviceTimeMinutes = company?.serviceTimeMinutes || 1;
      const estimatedWaitMinutes = peopleAhead * serviceTimeMinutes;

      return ServiceResponse.success("Position retrieved", {
        position,
        peopleAhead,
        queueNumber: entry.queueNumber,
        estimatedWaitMinutes,
      });
    } catch (error) {
      console.error("Error getting position:", error);
      return ServiceResponse.failure(
        "Failed to get position",
        error as Error,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getQueueStatus(
    companyId: string
  ): Promise<ServiceResponse<QueueStatus>> {
    try {
      const client = redisService.getClient();

      // Get current serving number
      const servingKey = redisService.getQueueServingKey(companyId);
      const currentServing = parseInt((await client.get(servingKey)) || "0");

      // Get queue size
      const queueListKey = redisService.getQueueListKey(companyId);
      const queueSize = await client.lLen(queueListKey);

      // Get company for service time and capacity
      const company = await this.companyRepository.findOne({
        where: { id: companyId },
      });

      if (!company) {
        return ServiceResponse.failure(
          "Company not found",
          undefined,
          StatusCodes.NOT_FOUND
        );
      }

      const serviceTimeMinutes = company.serviceTimeMinutes || 1;
      const maxCapacity = company.maxQueueCapacity || 100;
      const estimatedWaitMinutes = queueSize * serviceTimeMinutes;
      const isFull = queueSize >= maxCapacity;

      return ServiceResponse.success("Queue status retrieved", {
        currentServing,
        queueSize,
        estimatedWaitMinutes,
        isFull,
      });
    } catch (error) {
      console.error("Error getting queue status:", error);
      return ServiceResponse.failure(
        "Failed to get queue status",
        error as Error,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async nextCustomer(
    companyId: string
  ): Promise<ServiceResponse<{ servingNumber: number; entry?: QueueEntry }>> {
    try {
      const client = redisService.getClient();

      // Get current serving number
      const servingKey = redisService.getQueueServingKey(companyId);
      const currentServing = parseInt((await client.get(servingKey)) || "0");

      // Get next entry from queue
      const queueListKey = redisService.getQueueListKey(companyId);
      const entryId = await client.lIndex(queueListKey, 0);

      if (!entryId) {
        return ServiceResponse.failure(
          "No one in queue",
          undefined,
          StatusCodes.NOT_FOUND
        );
      }

      // Get entry from database
      const entry = await this.queueEntryRepository.findOne({
        where: { id: entryId },
      });

      if (entry) {
        // Mark current entry as completed
        entry.status = QueueEntryStatus.COMPLETED;
        entry.completedAt = new Date();
        await this.queueEntryRepository.save(entry);
      }

      // Remove from Redis list
      await client.lPop(queueListKey);

      // Increment serving number
      const newServingNumber = currentServing + 1;
      await client.set(servingKey, newServingNumber.toString());

      return ServiceResponse.success("Next customer served", {
        servingNumber: newServingNumber,
        entry: entry || undefined,
      });
    } catch (error) {
      console.error("Error serving next customer:", error);
      return ServiceResponse.failure(
        "Failed to serve next customer",
        error as Error,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async leaveQueue(
    userId: string,
    companyId: string
  ): Promise<ServiceResponse<null>> {
    try {
      const client = redisService.getClient();

      // Find queue entry
      const entry = await this.queueEntryRepository.findOne({
        where: {
          companyId,
          userId,
          status: QueueEntryStatus.WAITING,
        },
      });

      if (!entry) {
        return ServiceResponse.failure(
          "You are not in the queue",
          undefined,
          StatusCodes.NOT_FOUND
        );
      }

      // Remove from Redis list
      const queueListKey = redisService.getQueueListKey(companyId);
      await client.lRem(queueListKey, 1, entry.id);

      // Remove from Redis hash
      const entryKey = redisService.getQueueEntryKey(entry.id, companyId);
      await client.del(entryKey);

      // Update QueueEntry status to 'left' in PostgreSQL
      entry.status = QueueEntryStatus.LEFT;
      entry.leftAt = new Date();
      await this.queueEntryRepository.save(entry);

      return ServiceResponse.success("Successfully left queue", null);
    } catch (error) {
      console.error("Error leaving queue:", error);
      return ServiceResponse.failure(
        "Failed to leave queue",
        error as Error,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getQueueList(
    companyId: string,
    limit?: number
  ): Promise<ServiceResponse<QueueListEntry[]>> {
    try {
      const client = redisService.getClient();

      const queueListKey = redisService.getQueueListKey(companyId);
      const maxLimit = limit || 50;

      // Get entry IDs from Redis list
      const entryIds = await client.lRange(queueListKey, 0, maxLimit - 1);

      // Get entries from database
      const entries = await this.queueEntryRepository.find({
        where: {
          id: In(entryIds),
          companyId,
          status: QueueEntryStatus.WAITING,
        },
        order: {
          position: "ASC",
        },
      });

      // Map to QueueListEntry format
      const queueList: QueueListEntry[] = entries.map((entry) => ({
        queueNumber: entry.queueNumber,
        fullName: entry.fullName,
        position: entry.position,
        phoneNumber: entry.phoneNumber || undefined,
      }));

      return ServiceResponse.success("Queue list retrieved", queueList);
    } catch (error) {
      console.error("Error getting queue list:", error);
      return ServiceResponse.failure(
        "Failed to get queue list",
        error as Error,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async generateQueueNumber(companyId: string): Promise<string> {
    try {
      const client = redisService.getClient();

      // Get company queue prefix
      const company = await this.companyRepository.findOne({
        where: { id: companyId },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      const prefix = company.queuePrefix || "A";

      // Get current counter from Redis
      const counterKey = redisService.getQueueCounterKey(companyId);
      let counter = parseInt((await client.get(counterKey)) || "0");

      // Increment counter
      counter += 1;

      // Check if we need to rotate alphabet (every 999 entries)
      let alphabet = prefix;
      if (counter > 999) {
        // Rotate alphabet: A -> B -> ... -> Z -> AA -> AB -> ...
        const alphabetIndex = this.getAlphabetIndex(prefix);
        const newIndex = Math.floor((counter - 1) / 999);
        alphabet = this.getAlphabetFromIndex(alphabetIndex + newIndex);
        counter = ((counter - 1) % 999) + 1;
      }

      // Save counter back to Redis
      await client.set(counterKey, counter.toString());

      // Format: A-123
      return `${alphabet}-${counter.toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Error generating queue number:", error);
      throw error;
    }
  }

  private async getPositionFromRedis(
    companyId: string,
    entryId: string
  ): Promise<number> {
    const client = redisService.getClient();
    const queueListKey = redisService.getQueueListKey(companyId);
    const entryIds = await client.lRange(queueListKey, 0, -1);
    const index = entryIds.indexOf(entryId);
    return index >= 0 ? index + 1 : 0;
  }

  private getAlphabetIndex(alphabet: string): number {
    if (alphabet.length === 1) {
      return alphabet.charCodeAt(0) - 65;
    }
    let index = 0;
    for (let i = 0; i < alphabet.length; i++) {
      index = index * 26 + (alphabet.charCodeAt(i) - 64);
    }
    return index - 1;
  }

  private getAlphabetFromIndex(index: number): string {
    if (index < 26) {
      return String.fromCharCode(65 + index);
    }
    let result = "";
    index += 1;
    while (index > 0) {
      index -= 1;
      result = String.fromCharCode(65 + (index % 26)) + result;
      index = Math.floor(index / 26);
    }
    return result;
  }
}

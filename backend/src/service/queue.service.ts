import { In, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { QueueEntry, QueueEntryStatus } from "../entities/queueEntry.entity";
import { Company } from "../entities/company.entity";
import { redisService } from "./redis.service";
import { queueSocketService } from "../websocket/queue.socket";
import { ServiceResponse } from "../utils/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { randomUUID } from "crypto";

interface JoinQueueData {
  phoneNumber: string;
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
        userId: randomUUID(),
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

      // Emit WebSocket update
      const updatedQueueSize = await client.lLen(queueListKey);
      queueSocketService.emitQueueUpdate(companyId, {
        type: "JOINED",
        queueSize: updatedQueueSize,
        entry: {
          id: savedEntry.id,
          queueNumber: savedEntry.queueNumber,
          fullName: savedEntry.fullName,
          position: savedEntry.position,
        },
      });

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

  async joinQueueMany(
    companyId: string,
    usersData: JoinQueueData[]
  ): Promise<ServiceResponse<(QueueEntry & { position: number })[]>> {
    try {
      const client = redisService.getClient();

      // Get company details
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

      if (!usersData || usersData.length === 0) {
        return ServiceResponse.failure(
          "At least one user is required",
          undefined,
          StatusCodes.BAD_REQUEST
        );
      }

      // Check queue capacity
      const queueListKey = redisService.getQueueListKey(companyId);
      const currentQueueSize = await client.lLen(queueListKey);
      const maxCapacity = company.maxQueueCapacity || 100;

      if (currentQueueSize + usersData.length > maxCapacity) {
        return ServiceResponse.failure(
          `Queue capacity exceeded. Only ${
            maxCapacity - currentQueueSize
          } spots available`,
          undefined,
          StatusCodes.BAD_REQUEST
        );
      }

      // Check for duplicates in the input array
      const phoneNumbers = usersData.map((u) => u.phoneNumber);
      const phoneNumberCounts = new Map<string, number>();
      const duplicates: string[] = [];

      phoneNumbers.forEach((phone) => {
        const count = phoneNumberCounts.get(phone) || 0;
        phoneNumberCounts.set(phone, count + 1);
        if (count === 1) {
          // This is the second occurrence, add to duplicates
          duplicates.push(phone);
        }
      });

      if (duplicates.length > 0) {
        return ServiceResponse.failure(
          `Duplicate phone numbers in the request: ${duplicates.join(", ")}`,
          undefined,
          StatusCodes.BAD_REQUEST
        );
      }

      // Check if any users are already in queue
      const existingEntries = await this.queueEntryRepository.find({
        where: {
          companyId,
          phoneNumber: In(phoneNumbers),
          status: QueueEntryStatus.WAITING,
        },
      });

      if (existingEntries.length > 0) {
        const existingPhones = existingEntries.map((e) => e.phoneNumber);
        return ServiceResponse.failure(
          `Users with phone numbers ${existingPhones.join(
            ", "
          )} are already in the queue`,
          undefined,
          StatusCodes.BAD_REQUEST
        );
      }

      const savedEntries: (QueueEntry & { position: number })[] = [];
      let currentPosition = currentQueueSize;

      // Process each user
      for (const userData of usersData) {
        currentPosition += 1;
        const queueNumber = await this.generateQueueNumber(companyId);

        // Create QueueEntry in PostgreSQL
        const queueEntry = this.queueEntryRepository.create({
          companyId,
          userId: randomUUID(),
          phoneNumber: userData.phoneNumber,
          fullName: userData.fullName,
          queueNumber,
          position: currentPosition,
          status: QueueEntryStatus.WAITING,
        });

        const savedEntry = await this.queueEntryRepository.save(queueEntry);

        // Add to Redis list (right push to maintain order)
        await client.rPush(queueListKey, savedEntry.id);

        // Store entry details in Redis hash
        const entryKey = redisService.getQueueEntryKey(
          savedEntry.id,
          companyId
        );
        await client.hSet(entryKey, {
          id: savedEntry.id,
          queueNumber: savedEntry.queueNumber,
          fullName: savedEntry.fullName,
          phoneNumber: savedEntry.phoneNumber || "",
          position: savedEntry.position.toString(),
        });

        // Set expiration on hash (24 hours)
        await client.expire(entryKey, 86400);

        savedEntries.push({ ...savedEntry, position: savedEntry.position });
      }

      // Emit WebSocket update
      const updatedQueueSize = await client.lLen(queueListKey);
      queueSocketService.emitQueueUpdate(companyId, {
        type: "JOINED_MANY",
        queueSize: updatedQueueSize,
        entries: savedEntries.map((entry) => ({
          id: entry.id,
          queueNumber: entry.queueNumber,
          fullName: entry.fullName,
          position: entry.position,
        })),
        count: savedEntries.length,
      });

      return ServiceResponse.success(
        `Successfully added ${savedEntries.length} user(s) to queue`,
        savedEntries,
        StatusCodes.CREATED
      );
    } catch (error) {
      console.error("Error joining queue (many):", error);
      return ServiceResponse.failure(
        "Failed to join queue",
        error as Error,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getPosition(
    phoneNumber: string,
    companyId: string
  ): Promise<ServiceResponse<QueuePosition>> {
    try {
      const client = redisService.getClient();

      // Find queue entry
      const entry = await this.queueEntryRepository.findOne({
        where: {
          companyId,
          phoneNumber,
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

      // Emit WebSocket update
      const updatedQueueSize = await client.lLen(queueListKey);
      queueSocketService.emitQueueUpdate(companyId, {
        type: "NEXT_SERVED",
        queueSize: updatedQueueSize,
        servingNumber: newServingNumber,
        entry: entry
          ? {
              id: entry.id,
              queueNumber: entry.queueNumber,
              fullName: entry.fullName,
            }
          : undefined,
      });

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
    phoneNumber: string,
    companyId: string
  ): Promise<ServiceResponse<null>> {
    try {
      const client = redisService.getClient();

      // Find queue entry
      const entry = await this.queueEntryRepository.findOne({
        where: {
          companyId,
          phoneNumber,
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

      // Emit WebSocket update
      const updatedQueueSize = await client.lLen(queueListKey);
      queueSocketService.emitQueueUpdate(companyId, {
        type: "LEFT",
        queueSize: updatedQueueSize,
        entry: {
          id: entry.id,
          queueNumber: entry.queueNumber,
          fullName: entry.fullName,
        },
      });

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

  async getActiveQueues(phoneNumber: string): Promise<
    ServiceResponse<
      Array<{
        id: string;
        companyId: string;
        companyName: string;
        queueNumber: string;
        position: number;
        peopleAhead: number;
        estimatedWaitMinutes: number;
        joinedAt: Date;
      }>
    >
  > {
    try {
      const client = redisService.getClient();

      // Find all active queue entries for this phone number
      const entries = await this.queueEntryRepository.find({
        where: {
          phoneNumber,
          status: QueueEntryStatus.WAITING,
        },
        relations: [],
      });

      if (entries.length === 0) {
        return ServiceResponse.success("No active queues found", []);
      }

      // Get company IDs
      const companyIds = [...new Set(entries.map((e) => e.companyId))];

      // Fetch companies
      const companies = await this.companyRepository.find({
        where: {
          id: In(companyIds),
        },
      });

      const companyMap = new Map(companies.map((c) => [c.id, c]));

      // Build response with position and wait time for each queue
      const activeQueues = await Promise.all(
        entries.map(async (entry) => {
          const company = companyMap.get(entry.companyId);
          if (!company) {
            throw new Error(`Company ${entry.companyId} not found`);
          }

          // Get position from Redis
          const position = await this.getPositionFromRedis(
            entry.companyId,
            entry.id
          );

          // Get current serving number
          const servingKey = redisService.getQueueServingKey(entry.companyId);
          const currentServing = parseInt(
            (await client.get(servingKey)) || "0"
          );

          const peopleAhead = Math.max(0, position - currentServing);
          const serviceTimeMinutes = company.serviceTimeMinutes || 1;
          const estimatedWaitMinutes = peopleAhead * serviceTimeMinutes;

          return {
            id: entry.id,
            companyId: entry.companyId,
            companyName: company.name,
            queueNumber: entry.queueNumber,
            position,
            peopleAhead,
            estimatedWaitMinutes,
            joinedAt: entry.joinedAt,
          };
        })
      );

      return ServiceResponse.success("Active queues retrieved", activeQueues);
    } catch (error) {
      console.error("Error getting active queues:", error);
      return ServiceResponse.failure(
        "Failed to get active queues",
        error as Error,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getDashboardStats(companyId: string): Promise<
    ServiceResponse<{
      currentServing: number;
      totalWaiting: number;
      servedToday: number;
      avgProcessingTimeMinutes: number;
      queueList: QueueListEntry[];
    }>
  > {
    try {
      const client = redisService.getClient();

      // Get current serving number
      const servingKey = redisService.getQueueServingKey(companyId);
      const currentServing = parseInt((await client.get(servingKey)) || "0");

      // Get queue size
      const queueListKey = redisService.getQueueListKey(companyId);
      const totalWaiting = await client.lLen(queueListKey);

      // Get queue list
      const queueListResponse = await this.getQueueList(companyId, 50);
      const queueList =
        queueListResponse.success && queueListResponse.data
          ? queueListResponse.data
          : [];

      // Get today's date range (start of day to now)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get served today count (entries completed today)
      const servedToday = await this.queueEntryRepository
        .createQueryBuilder("entry")
        .where("entry.companyId = :companyId", { companyId })
        .andWhere("entry.status = :status", {
          status: QueueEntryStatus.COMPLETED,
        })
        .andWhere("entry.completedAt >= :today", { today })
        .andWhere("entry.completedAt < :tomorrow", { tomorrow })
        .getCount();

      // Get average processing time for today's completed entries
      const todayCompletedEntries = await this.queueEntryRepository
        .createQueryBuilder("entry")
        .where("entry.companyId = :companyId", { companyId })
        .andWhere("entry.status = :status", {
          status: QueueEntryStatus.COMPLETED,
        })
        .andWhere("entry.completedAt >= :today", { today })
        .andWhere("entry.completedAt < :tomorrow", { tomorrow })
        .select(["entry.joinedAt", "entry.completedAt"])
        .getMany();

      let avgProcessingTimeMinutes = 0;
      if (todayCompletedEntries.length > 0) {
        const totalProcessingTime = todayCompletedEntries.reduce(
          (sum, entry) => {
            if (entry.completedAt && entry.joinedAt) {
              const processingTime =
                entry.completedAt.getTime() - entry.joinedAt.getTime();
              return sum + processingTime;
            }
            return sum;
          },
          0
        );
        avgProcessingTimeMinutes = Math.round(
          totalProcessingTime / todayCompletedEntries.length / 1000 / 60
        );
      }

      return ServiceResponse.success("Dashboard stats retrieved", {
        currentServing,
        totalWaiting,
        servedToday,
        avgProcessingTimeMinutes,
        queueList,
      });
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return ServiceResponse.failure(
        "Failed to get dashboard stats",
        error as Error,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async emptyQueue(
    companyId: string
  ): Promise<ServiceResponse<{ clearedCount: number }>> {
    try {
      const client = redisService.getClient();

      // Verify company exists
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

      // Get all waiting entries for this company
      const waitingEntries = await this.queueEntryRepository.find({
        where: {
          companyId,
          status: QueueEntryStatus.WAITING,
        },
      });

      const clearedCount = waitingEntries.length;

      // Delete Redis queue list
      const queueListKey = redisService.getQueueListKey(companyId);
      await client.del(queueListKey);

      // Delete all Redis entry hashes
      const entryKeys = waitingEntries.map((entry) =>
        redisService.getQueueEntryKey(entry.id, companyId)
      );
      if (entryKeys.length > 0) {
        await client.del(entryKeys);
      }

      // Update all waiting entries in PostgreSQL to LEFT status
      if (waitingEntries.length > 0) {
        const now = new Date();
        await this.queueEntryRepository.update(
          {
            companyId,
            status: QueueEntryStatus.WAITING,
          },
          {
            status: QueueEntryStatus.LEFT,
            leftAt: now,
          }
        );
      }

      // Reset serving number to 0
      const servingKey = redisService.getQueueServingKey(companyId);
      await client.set(servingKey, "0");

      // Emit WebSocket update
      queueSocketService.emitQueueUpdate(companyId, {
        type: "QUEUE_EMPTIED",
        queueSize: 0,
        clearedCount,
      });

      return ServiceResponse.success(
        `Queue emptied successfully. ${clearedCount} entry(ies) removed.`,
        { clearedCount },
        StatusCodes.OK
      );
    } catch (error) {
      console.error("Error emptying queue:", error);
      return ServiceResponse.failure(
        "Failed to empty queue",
        error as Error,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

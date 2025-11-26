export interface GetCompaniesParams {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface JoinQueueParams {
  fullName: string;
  phoneNumber: string;
}

export interface QueueStatus {
  currentServing: number;
  queueSize: number;
  estimatedWaitMinutes: number;
  isFull: boolean;
}

export interface QueueListEntry {
  queueNumber: string;
  fullName: string;
  position: number;
  phoneNumber?: string;
}

export interface QueuePosition {
  position: number;
  peopleAhead: number;
  queueNumber: string;
  estimatedWaitMinutes: number;
}

export interface ServiceResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  error?: any;
}

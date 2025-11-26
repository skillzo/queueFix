export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: {
    data: T | null;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  statusCode: number;
  error: {
    code: string;
    message: string;
    field?: string;
  } | null;
}

export interface Company {
  id: string;
  name: string;
  category: string;
  currentQueueSize: number;
  serviceTimeMinutes: number; // in minutes
  address: string;
  imageUrl?: string;
  description?: string;
  hours?: {
    weekdays: string;
    weekends: string;
  };
}

export interface QueueEntry {
  id: string;
  companyId: string;
  companyName?: string;
  position: number;
  serviceTimeMinutes?: number;
  fullName: string;
  phoneNumber?: string;
  queueNumber?: string;
  joinedAt: Date;
}

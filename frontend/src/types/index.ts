export interface Company {
  id: string;
  name: string;
  category: string;
  currentQueueSize: number;
  estimatedWaitTime: number; // in minutes
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
  companyName: string;
  position: number;
  estimatedWaitTime: number;
  fullName: string;
  phoneNumber?: string;
  joinedAt: Date;
}

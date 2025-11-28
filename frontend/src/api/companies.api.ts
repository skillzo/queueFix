import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import type { ApiResponse, Company, QueueEntry } from "../types";
import type {
  ServiceResponse,
  GetCompaniesParams,
  JoinQueueParams,
  QueueListEntry,
  QueuePosition,
  QueueStatus,
  ActiveQueue,
} from "../types/company";

export const getCompanies = async (
  params?: GetCompaniesParams
): Promise<ApiResponse<Company[]>> => {
  const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
    params,
  });

  return companiesResponse?.data;
};

export const getCompanyById = async (id: string) => {
  const companyResponse = await axios.get(`${API_BASE_URL}/companies/${id}`);
  return companyResponse?.data;
};

export const getQueueStatus = async (
  companyId: string
): Promise<ApiResponse<QueueStatus>> => {
  const statusResponse = await axios.get(
    `${API_BASE_URL}/queues/${companyId}/status`
  );
  return statusResponse?.data;
};

export const joinQueue = async (
  companyId: string,
  params: JoinQueueParams
): Promise<ServiceResponse<QueueEntry>> => {
  const queueResponse = await axios.post(
    `${API_BASE_URL}/queues/${companyId}/join`,
    params
  );
  return queueResponse?.data;
};

export const getQueueList = async (
  companyId: string,
  limit?: number
): Promise<ServiceResponse<QueueListEntry[]>> => {
  const response = await axios.get(`${API_BASE_URL}/queues/${companyId}/list`, {
    params: limit ? { limit } : {},
  });
  return response?.data;
};

export const getQueuePosition = async (
  companyId: string,
  phoneNumber: string
): Promise<ServiceResponse<QueuePosition>> => {
  const response = await axios.get(
    `${API_BASE_URL}/queues/${companyId}/position`,
    {
      params: { phoneNumber },
    }
  );
  return response?.data;
};

export const leaveQueue = async (
  companyId: string,
  phoneNumber: string
): Promise<ServiceResponse<null>> => {
  const response = await axios.post(
    `${API_BASE_URL}/queues/${companyId}/leave`,
    null,
    {
      params: { phoneNumber },
    }
  );
  return response?.data;
};

export const getActiveQueues = async (
  phoneNumber: string
): Promise<ServiceResponse<ActiveQueue[]>> => {
  const response = await axios.get(`${API_BASE_URL}/queues/active`, {
    params: { phoneNumber },
  });
  return response?.data;
};

// Admin API functions
export interface DashboardStats {
  currentServing: number;
  totalWaiting: number;
  servedToday: number;
  avgProcessingTimeMinutes: number;
  queueList: Array<{
    queueNumber: string;
    fullName: string;
    position: number;
    phoneNumber?: string;
  }>;
}

export interface NextCustomerResponse {
  servingNumber: number;
  entry?: {
    id: string;
    queueNumber: string;
    fullName: string;
    phoneNumber?: string;
  };
}

export const getDashboardStats = async (
  companyId: string
): Promise<ServiceResponse<DashboardStats>> => {
  const response = await axios.get(
    `${API_BASE_URL}/queues/${companyId}/dashboard`
  );
  return response?.data;
};

export const nextCustomer = async (
  companyId: string
): Promise<ServiceResponse<NextCustomerResponse>> => {
  const response = await axios.post(`${API_BASE_URL}/queues/${companyId}/next`);
  return response?.data;
};

export interface AutopilotStatus {
  companyId: string;
  isActive: boolean;
}

export const startAutopilot = async (
  companyId: string
): Promise<ServiceResponse<AutopilotStatus>> => {
  const response = await axios.post(
    `${API_BASE_URL}/queues/${companyId}/autopilot/start`
  );
  return response?.data;
};

export const stopAutopilot = async (
  companyId: string
): Promise<ServiceResponse<AutopilotStatus>> => {
  const response = await axios.post(
    `${API_BASE_URL}/queues/${companyId}/autopilot/stop`
  );
  return response?.data;
};

export const getAutopilotStatus = async (
  companyId: string
): Promise<ServiceResponse<AutopilotStatus>> => {
  const response = await axios.get(
    `${API_BASE_URL}/queues/${companyId}/autopilot/status`
  );
  return response?.data;
};

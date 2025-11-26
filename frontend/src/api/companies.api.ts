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

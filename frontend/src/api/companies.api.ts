import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import type { ApiResponse, Company, QueueEntry } from "../types";

interface GetCompaniesParams {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

interface JoinQueueParams {
  fullName: string;
  phoneNumber: string;
}

interface QueueStatus {
  currentServing: number;
  queueSize: number;
  estimatedWaitMinutes: number;
  isFull: boolean;
}

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
): Promise<ApiResponse<QueueEntry>> => {
  const queueResponse = await axios.post(
    `${API_BASE_URL}/queues/${companyId}/join`,
    params
  );
  return queueResponse?.data;
};

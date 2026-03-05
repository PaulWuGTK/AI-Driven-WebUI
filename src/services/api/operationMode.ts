import { callApi } from '../apiClient';
import type { OperationModeResponse, OperationModeUpdateRequest } from '../../types/operationMode';
import {
  getOperationModeMockData,
  updateOperationModeMockData
} from '../mockData/operationModeMockData';

const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = '/API';

export const getOperationMode = async (): Promise<OperationModeResponse> => {
  if (isDevelopment) {
    return getOperationModeMockData();
  }
  return callApi<OperationModeResponse>(`${API_BASE_URL}/info?list=OperationMode`);
};

export const updateOperationMode = async (data: OperationModeUpdateRequest): Promise<OperationModeResponse> => {
  if (isDevelopment) {
    return updateOperationModeMockData(data);
  }
  return callApi<OperationModeResponse>(`${API_BASE_URL}/info?list=OperationMode`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

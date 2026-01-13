import { callApi } from '../apiClient';
import type { OperationModeResponse, OperationModeUpdateRequest } from '../../types/operationMode';
import { getMockOperationMode, updateMockOperationMode } from '../mockApi';

const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = '/API';

export const getOperationMode = async (): Promise<OperationModeResponse> => {
  if (isDevelopment) {
    return getMockOperationMode();
  }
  return callApi<OperationModeResponse>(`${API_BASE_URL}/info?list=OperationMode`);
};

export const updateOperationMode = async (data: OperationModeUpdateRequest): Promise<OperationModeResponse> => {
  if (isDevelopment) {
    return updateMockOperationMode(data);
  }
  return callApi<OperationModeResponse>(`${API_BASE_URL}/info?list=OperationMode`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

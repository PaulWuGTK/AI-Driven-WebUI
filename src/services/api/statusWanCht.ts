import { callApi } from '../apiClient';
import type { StatusWanChtResponse } from '../../types/statusWanCht';
import { statusWanChtMockData } from '../mockData/statusWanChtMockData';

const isDevelopment = import.meta.env.DEV;

export const getStatusWanCht = async (): Promise<StatusWanChtResponse> => {
  if (isDevelopment) {
    return statusWanChtMockData;
  }

  return callApi<StatusWanChtResponse>('/API/info?list=StatusWanCht');
};

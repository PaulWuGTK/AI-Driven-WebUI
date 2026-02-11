import { callApi } from '../apiClient';
import type { StatusLanChtResponse } from '../../types/statusLanCht';
import { statusLanChtMockData } from '../mockData/statusLanChtMockData';

const isDevelopment = import.meta.env.DEV;

export const getStatusLanCht = async (): Promise<StatusLanChtResponse> => {
  if (isDevelopment) {
    return statusLanChtMockData;
  }

  return callApi<StatusLanChtResponse>('/API/info?list=StatusLanCht');
};

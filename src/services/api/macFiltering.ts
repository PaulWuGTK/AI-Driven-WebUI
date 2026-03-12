import type { MACFilteringResponse, MACFilteringUpdateRequest } from '../../types/macFiltering';
import { callApi } from '../apiClient';
import {
  getMACFilteringMockData,
  updateMACFilteringMockData
} from '../mockData/macFilteringMockData';

const isDevelopment = import.meta.env.DEV;

export const getMACFiltering = async (): Promise<MACFilteringResponse> => {
  if (isDevelopment) {
    return getMACFilteringMockData();
  }

  return callApi<MACFilteringResponse>('/API/info?list=MACFiltering');
};

export const updateMACFiltering = async (data: MACFilteringUpdateRequest): Promise<MACFilteringResponse> => {
  if (isDevelopment) {
    console.log('Update MAC Filtering:', data);
    return updateMACFilteringMockData(data);
  }

  return callApi<MACFilteringResponse>('/API/info?list=MACFiltering', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

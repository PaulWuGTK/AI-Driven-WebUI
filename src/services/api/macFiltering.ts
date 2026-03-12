import type { MACFilteringResponse, MACFilteringUpdateRequest } from '../../types/macFiltering';
import { handleApiResponse } from '../../utils/apiUtils';
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

  const response = await fetch('/API/info?list=MACFiltering', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<MACFilteringResponse>(response);
};

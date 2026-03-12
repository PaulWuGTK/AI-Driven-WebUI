import type { GeneralMacFilteringResponse, GeneralMacFilteringUpdateRequest } from '../../types/generalMacFiltering';
import { handleApiResponse } from '../../utils/apiUtils';
import { callApi } from '../apiClient';
import {
  getGeneralMacFilteringMockData,
  updateGeneralMacFilteringMockData
} from '../mockData/generalMacFilteringMockData';

const isDevelopment = import.meta.env.DEV;

export const getGeneralMacFiltering = async (): Promise<GeneralMacFilteringResponse> => {
  if (isDevelopment) {
    return getGeneralMacFilteringMockData();
  }

  return callApi<GeneralMacFilteringResponse>('/API/info?list=MACFiltering');
};

export const updateGeneralMacFiltering = async (data: GeneralMacFilteringUpdateRequest): Promise<GeneralMacFilteringResponse> => {
  if (isDevelopment) {
    console.log('Update General MAC Filtering:', data);
    return updateGeneralMacFilteringMockData(data);
  }

  const response = await fetch('/API/info?list=MACFiltering', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<GeneralMacFilteringResponse>(response);
};

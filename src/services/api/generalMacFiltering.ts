import type { GeneralMacFilteringResponse, GeneralMacFilteringUpdateRequest } from '../../types/generalMacFiltering';
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

  return callApi<GeneralMacFilteringResponse>('/API/info?list=MACFiltering', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

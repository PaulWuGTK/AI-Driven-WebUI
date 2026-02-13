import { callApi } from '../apiClient';
import type { BasicBridgeLanResponse, BasicBridgeLanUpdateRequest } from '../../types/basicBridgeLan';
import { basicBridgeLanMockData } from '../mockData/basicBridgeLanMockData';
import { handleApiResponse } from '../../utils/apiUtils';

const isDevelopment = import.meta.env.DEV;

export const getBasicBridgeLan = async (): Promise<BasicBridgeLanResponse> => {
  if (isDevelopment) {
    return basicBridgeLanMockData;
  }

  return callApi<BasicBridgeLanResponse>('/API/info?list=BasicBridgeLan');
};

export const updateBasicBridgeLan = async (data: BasicBridgeLanUpdateRequest): Promise<BasicBridgeLanResponse> => {
  if (isDevelopment) {
    console.log('Update Basic LAN CHT:', data);
    return getBasicBridgeLan();
  }

  const response = await fetch('/API/info?list=BasicBridgeLan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse<BasicBridgeLanResponse>(response);
};

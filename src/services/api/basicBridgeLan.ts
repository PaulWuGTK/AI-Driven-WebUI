import { callApi } from '../apiClient';
import type { BasicBridgeLanResponse, BasicBridgeLanUpdateRequest } from '../../types/basicBridgeLan';
import { basicBridgeLanMockData } from '../mockData/basicBridgeLanMockData';
import { toFlag01 } from '../flag01';

const isDevelopment = import.meta.env.DEV;

export const getBasicBridgeLan = async (): Promise<BasicBridgeLanResponse> => {
  if (isDevelopment) {
    return basicBridgeLanMockData;
  }
  const response = await callApi<BasicBridgeLanResponse>('/API/info?list=BasicBridgeLan');
  return {
    ...response,
    BasicBridgeLan: {
      ...response.BasicBridgeLan,
      IPv4Enable: toFlag01(response.BasicBridgeLan.IPv4Enable),
      IPv6Enable: toFlag01(response.BasicBridgeLan.IPv6Enable),
    }
  };
};

export const updateBasicBridgeLan = async (data: BasicBridgeLanUpdateRequest): Promise<BasicBridgeLanResponse> => {
  if (isDevelopment) {
    console.log('Update Basic LAN CHT:', data);
    return getBasicBridgeLan();
  }
  const normalized: BasicBridgeLanUpdateRequest = {
    BasicBridgeLan: {
      ...data.BasicBridgeLan,
      IPv4Enable: toFlag01(data.BasicBridgeLan.IPv4Enable),
      IPv6Enable: toFlag01(data.BasicBridgeLan.IPv6Enable),
    }
  };
  return callApi<BasicBridgeLanResponse>('/API/info?list=BasicBridgeLan', {
    method: 'POST',
    body: JSON.stringify(normalized),
  });
};

import { callApi } from '../apiClient';
import type { BasicBridgeLanResponse, BasicBridgeLanUpdateRequest } from '../../types/basicBridgeLan';
import { basicBridgeLanMockData } from '../mockData/basicBridgeLanMockData';

const isDevelopment = import.meta.env.DEV;
const toFlag01 = (value: unknown): 0 | 1 =>
  value === 1 || value === '1' || value === true ? 1 : 0;

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

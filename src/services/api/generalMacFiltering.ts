import type { GeneralMacFilteringResponse, GeneralMacFilteringUpdateRequest } from '../../types/generalMacFiltering';
import { callApi } from '../apiClient';
import {
  getGeneralMacFilteringMockData,
  updateGeneralMacFilteringMockData
} from '../mockData/generalMacFilteringMockData';

const isDevelopment = import.meta.env.DEV;
const toFlag01 = (value: unknown): 0 | 1 => (
  value === 1 || value === '1' || value === true ? 1 : 0
);

const normalizeResponse = (data: GeneralMacFilteringResponse): GeneralMacFilteringResponse => ({
  MACFiltering: {
    Enable: toFlag01(data.MACFiltering.Enable),
    WhiteList: data.MACFiltering.WhiteList,
    BlackList: data.MACFiltering.BlackList
  }
});

export const getGeneralMacFiltering = async (): Promise<GeneralMacFilteringResponse> => {
  if (isDevelopment) {
    return normalizeResponse(getGeneralMacFilteringMockData());
  }

  const response = await callApi<GeneralMacFilteringResponse>('/API/info?list=MACFiltering');
  return normalizeResponse(response);
};

export const updateGeneralMacFiltering = async (data: GeneralMacFilteringUpdateRequest): Promise<GeneralMacFilteringResponse> => {
  const normalizedData: GeneralMacFilteringUpdateRequest = {
    MACFiltering: {
      Enable: toFlag01(data.MACFiltering.Enable),
      WhiteList: data.MACFiltering.WhiteList,
      BlackList: data.MACFiltering.BlackList
    }
  };

  if (isDevelopment) {
    console.log('Update General MAC Filtering:', normalizedData);
    return normalizeResponse(updateGeneralMacFilteringMockData(normalizedData));
  }

  const response = await callApi<GeneralMacFilteringResponse>('/API/info?list=MACFiltering', {
    method: 'POST',
    body: JSON.stringify(normalizedData),
  });
  return normalizeResponse(response);
};

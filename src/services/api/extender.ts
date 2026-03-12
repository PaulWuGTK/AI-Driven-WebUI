import type { ExtenderResponse, ExtenderScanResponse, ExtenderUpdateRequest, ExtenderConnectRequest } from '../../types/extender';
import { callApi } from '../apiClient';
import {
  connectExtenderMockData,
  getExtenderMockData,
  getExtenderScanMockData,
  triggerWpsMockData,
  updateExtenderMockData
} from '../mockData/extenderMockData';

const isDevelopment = import.meta.env.DEV;

export const getExtenderStatus = async (): Promise<ExtenderResponse> => {
  if (isDevelopment) {
    return getExtenderMockData();
  }
  return callApi<ExtenderResponse>('/API/info?list=Extender');
};

export const updateExtenderSettings = async (data: ExtenderUpdateRequest): Promise<ExtenderResponse> => {
  if (isDevelopment) {
    return updateExtenderMockData(data);
  }

  return callApi<ExtenderResponse>('/API/info?list=Extender', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const scanNeighborAPs = async (): Promise<ExtenderScanResponse> => {
  if (isDevelopment) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getExtenderScanMockData();
  }

  return callApi<ExtenderScanResponse>('/API/info?list=ExtenderScan', {
    method: 'POST',
    body: JSON.stringify({
      ExtenderScan: {
        Action: "trigger_scan"
      }
    }),
  });
};

export const connectToAP = async (data: ExtenderConnectRequest): Promise<ExtenderResponse> => {
  if (isDevelopment) {
    return connectExtenderMockData(data);
  }

  return callApi<ExtenderResponse>('/API/info?list=Extender', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const triggerWPS = async (): Promise<ExtenderResponse> => {
  if (isDevelopment) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return triggerWpsMockData();
  }

  return callApi<ExtenderResponse>('/API/info?list=Extender', {
    method: 'POST',
    body: JSON.stringify({
      Extender: {
        Action: "WPSbtn"
      }
    }),
  });
};

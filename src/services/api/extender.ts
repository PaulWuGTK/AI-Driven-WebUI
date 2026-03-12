import type { ExtenderResponse, ExtenderScanResponse, ExtenderUpdateRequest, ExtenderConnectRequest } from '../../types/extender';
import { handleApiResponse } from '../../utils/apiUtils';
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

  const response = await fetch('/API/info?list=Extender', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse<ExtenderResponse>(response);
};

export const scanNeighborAPs = async (): Promise<ExtenderScanResponse> => {
  if (isDevelopment) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getExtenderScanMockData();
  }

  const response = await fetch('/API/info?list=ExtenderScan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ExtenderScan: {
        Action: "trigger_scan"
      }
    }),
  });
  return handleApiResponse<ExtenderScanResponse>(response);
};

export const connectToAP = async (data: ExtenderConnectRequest): Promise<ExtenderResponse> => {
  if (isDevelopment) {
    return connectExtenderMockData(data);
  }

  const response = await fetch('/API/info?list=Extender', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse<ExtenderResponse>(response);
};

export const triggerWPS = async (): Promise<ExtenderResponse> => {
  if (isDevelopment) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return triggerWpsMockData();
  }

  const response = await fetch('/API/info?list=Extender', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Extender: {
        Action: "WPSbtn"
      }
    }),
  });
  return handleApiResponse<ExtenderResponse>(response);
};

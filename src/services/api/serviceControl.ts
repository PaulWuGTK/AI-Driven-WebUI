import type { ServiceControlResponse, ServiceControlUpdateRequest } from '../../types/serviceControl';
import { callApi } from '../apiClient';
import {
  getServiceControlMockData,
  updateServiceControlMockData
} from '../mockData/serviceControlMockData';

const isDevelopment = import.meta.env.DEV;

export const getServiceControl = async (): Promise<ServiceControlResponse> => {
  if (isDevelopment) {
    return getServiceControlMockData();
  }
  const data = await callApi<ServiceControlResponse>('/API/info?list=AdvancedServiceControl');
  // 保險：確保每筆規則有 InterfaceOriginal（舊資料或舊後端時）
  data.AdvancedServiceControl.Rules =
    (data.AdvancedServiceControl.Rules || []).map(r => ({
      ...r,
      InterfaceOriginal: (r as any).InterfaceOriginal ?? r.Interface,
    }));
  return data;
};

export const updateServiceControl = async (data: ServiceControlUpdateRequest): Promise<ServiceControlResponse> => {
  if (isDevelopment) {
    console.log('Update Service Control:', data);
    return updateServiceControlMockData(data);
  }

  return callApi<ServiceControlResponse>('/API/info?list=AdvancedServiceControl', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

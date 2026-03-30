import type { ServiceControlResponse, ServiceControlUpdateRequest } from '../../types/serviceControl';
import { callApi } from '../apiClient';
import {
  getServiceControlMockData,
  updateServiceControlMockData
} from '../mockData/serviceControlMockData';
import { toFlag01 } from '../flag01';

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
      Enable: toFlag01(r.Enable),
      InterfaceOriginal: (r as any).InterfaceOriginal ?? r.Interface,
    }));
  return data;
};

export const updateServiceControl = async (data: ServiceControlUpdateRequest): Promise<ServiceControlResponse> => {
  const normalized: ServiceControlUpdateRequest = {
    AdvancedServiceControl: {
      ...data.AdvancedServiceControl,
      Rules: (data.AdvancedServiceControl.Rules || []).map(rule => ({
        ...rule,
        Enable: toFlag01(rule.Enable),
      }))
    }
  };
  if (isDevelopment) {
    console.log('Update Service Control:', normalized);
    return updateServiceControlMockData(normalized);
  }

  return callApi<ServiceControlResponse>('/API/info?list=AdvancedServiceControl', {
    method: 'POST',
    body: JSON.stringify(normalized),
  });
};

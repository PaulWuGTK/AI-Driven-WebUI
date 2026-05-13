import type { ServiceControlResponse, ServiceControlUpdateRequest } from '../../types/serviceControl';
import { callApi } from '../apiClient';
import { isOpenWrtWifiLogoMode } from '../../config/runtimeMode';
import {
  getServiceControlMockData,
  updateServiceControlMockData
} from '../mockData/serviceControlMockData';
import { toFlag01 } from '../flag01';

const isDevelopment = import.meta.env.DEV || isOpenWrtWifiLogoMode;

export const getServiceControl = async (): Promise<ServiceControlResponse> => {
  if (isDevelopment) {
    return getServiceControlMockData();
  }
  const data = await callApi<ServiceControlResponse>('/API/info?list=AdvancedServiceControl');
  // ä¿éšªï¼šç¢ºä¿æ?ç­†è??‡æ? InterfaceOriginalï¼ˆè?è³‡æ??–è?å¾Œç«¯?‚ï?
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

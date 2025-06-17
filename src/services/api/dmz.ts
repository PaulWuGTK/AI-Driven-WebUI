import type { DmzResponse, DmzUpdateRequest } from '../../types/dmz';
import { callApi } from '../apiClient';
import { handleApiResponse } from '../../utils/apiUtils';

const isDevelopment = import.meta.env.DEV;

export const getDmz = async (): Promise<DmzResponse> => {
  if (isDevelopment) {
    return {
      AdvancedDmz: {
        Enable: false,
        IPAddress: "192.168.101.168"
      }
    };
  }
  return callApi<DmzResponse>('/API/info?list=AdvancedDmz');
};

export const updateDmz = async (data: DmzUpdateRequest): Promise<DmzResponse> => {
  if (isDevelopment) {
    console.log('Update DMZ settings:', data);
    return {
      AdvancedDmz: {
        ...data.AdvancedDmz
      }
    };
  }

  const response = await fetch('/API/info?list=AdvancedDmz', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse<DmzResponse>(response);
};
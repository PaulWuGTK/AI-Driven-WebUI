import type { DmzResponse, DmzUpdateRequest } from '../../types/dmz';
import { callApi } from '../apiClient';

const isDevelopment = import.meta.env.DEV;
const toFlag01 = (value: unknown): 0 | 1 =>
  value === 1 || value === '1' || value === true ? 1 : 0;

export const getDmz = async (): Promise<DmzResponse> => {
  if (isDevelopment) {
    return {
      AdvancedDmz: {
        Enable: 0,
        IPAddress: "192.168.101.168"
      }
    };
  }
  const response = await callApi<DmzResponse>('/API/info?list=AdvancedDmz');
  return {
    ...response,
    AdvancedDmz: {
      ...response.AdvancedDmz,
      Enable: toFlag01(response.AdvancedDmz.Enable),
    }
  };
};

export const updateDmz = async (data: DmzUpdateRequest): Promise<DmzResponse> => {
  const normalized: DmzUpdateRequest = {
    AdvancedDmz: {
      ...data.AdvancedDmz,
      Enable: toFlag01(data.AdvancedDmz.Enable),
    }
  };
  if (isDevelopment) {
    console.log('Update DMZ settings:', data);
    return {
      AdvancedDmz: {
        ...normalized.AdvancedDmz
      }
    };
  }

  return callApi<DmzResponse>('/API/info?list=AdvancedDmz', {
    method: 'POST',
    body: JSON.stringify(normalized),
  });
};

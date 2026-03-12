import type { UpnpResponse, UpnpUpdateRequest, UpnpUpdateResponse } from '../../types/upnp';
import { callApi } from '../apiClient';
import { getUpnpMockData, updateUpnpMockData } from '../mockData/upnpMockData';

const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = '/API';

export async function getUpnpSettings(): Promise<UpnpResponse> {
  if (isDevelopment) {
    return getUpnpMockData();
  }
  return callApi<UpnpResponse>(`${API_BASE_URL}/info?list=ApplicationUpnp`);
}

export async function updateUpnpSettings(data: UpnpUpdateRequest): Promise<UpnpUpdateResponse> {
  if (isDevelopment) {
    return updateUpnpMockData(data);
  }

  return callApi<UpnpUpdateResponse>(`${API_BASE_URL}/info?list=ApplicationUpnp`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

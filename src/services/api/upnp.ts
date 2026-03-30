import type { UpnpResponse, UpnpUpdateRequest, UpnpUpdateResponse } from '../../types/upnp';
import { callApi } from '../apiClient';
import { getUpnpMockData, updateUpnpMockData } from '../mockData/upnpMockData';
import { toFlag01 } from '../flag01';

const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = '/API';

const normalizeResponse = (response: UpnpResponse): UpnpResponse => ({
  ApplicationUpnp: {
    ...response.ApplicationUpnp,
    Enable: toFlag01(response.ApplicationUpnp.Enable),
    PortMappings: response.ApplicationUpnp.PortMappings?.map((mapping) => ({
      ...mapping,
      Enable: toFlag01(mapping.Enable)
    }))
  }
});

export async function getUpnpSettings(): Promise<UpnpResponse> {
  if (isDevelopment) {
    return normalizeResponse(getUpnpMockData());
  }
  const response = await callApi<UpnpResponse>(`${API_BASE_URL}/info?list=ApplicationUpnp`);
  return normalizeResponse(response);
}

export async function updateUpnpSettings(data: UpnpUpdateRequest): Promise<UpnpUpdateResponse> {
  const normalizedData: UpnpUpdateRequest = {
    ApplicationUpnp: {
      Enable: toFlag01(data.ApplicationUpnp.Enable),
      Interface: data.ApplicationUpnp.Interface
    }
  };

  if (isDevelopment) {
    return updateUpnpMockData(normalizedData);
  }

  return callApi<UpnpUpdateResponse>(`${API_BASE_URL}/info?list=ApplicationUpnp`, {
    method: 'POST',
    body: JSON.stringify(normalizedData)
  });
}

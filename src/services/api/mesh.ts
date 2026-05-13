import type { MeshMapResponse, SteeringControlData } from '../../types/mesh';
import { callApi } from '../apiClient';
import { getMeshMapMockData } from '../mockData/meshMockData';
import { isOpenWrtWifiLogoMode } from '../../config/runtimeMode';

const isDevelopment = import.meta.env.DEV || isOpenWrtWifiLogoMode;

export async function getMeshMap(): Promise<MeshMapResponse | { NOK: string }> {
  if (isDevelopment) {
    return getMeshMapMockData();
  }
  return callApi<MeshMapResponse | { NOK: string }>('/API/info?list=MeshMap');
}

export async function applySteeringControl(data: SteeringControlData): Promise<void> {
  const payload = {
    MeshMap: {
      StationMac: data.stationMac,
      TargetBssid: data.targetBssid,
      Band: data.band
    }
  };

  if (isDevelopment) {
    console.log('Steering control payload:', payload);
    return Promise.resolve();
  }

  await callApi<unknown>('/API/info?list=MeshMap', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

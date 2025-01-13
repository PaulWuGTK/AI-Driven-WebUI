import type { MeshMapResponse, SteeringControlData } from '../../types/mesh';
import { handleApiResponse } from '../../utils/apiUtils';
import { getMockMeshMap } from '../mockApi';

const isDevelopment = import.meta.env.DEV;

export async function getMeshMap(): Promise<MeshMapResponse | { NOK: string }> {
  if (isDevelopment) {
    return getMockMeshMap();
  }
  const response = await fetch('/API/info?list=MeshMap');
  return handleApiResponse<MeshMapResponse | { NOK: string }>(response);
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

  const response = await fetch('/API/info?list=MeshMap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleApiResponse(response);
}
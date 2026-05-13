import apiClient from '../apiClient';
import type { CellularResponse, CellularConfigRequest } from '../../types/cellular';
import { cellularMockData } from '../mockData/cellularMockData';
import { toFlag01 } from '../flag01';
import { isOpenWrtWifiLogoMode } from '../../config/runtimeMode';

const isDevelopment = import.meta.env.DEV || isOpenWrtWifiLogoMode;

const normalizeResponse = (response: CellularResponse): CellularResponse => ({
  Cellular: {
    ...response.Cellular,
    RoamingEnabled: toFlag01(response.Cellular.RoamingEnabled),
    InterfaceEnable: toFlag01(response.Cellular.InterfaceEnable)
  }
});

export async function getCellularStatus(): Promise<CellularResponse> {
  if (isDevelopment) {
    return normalizeResponse(cellularMockData);
  }
  const response = await apiClient.get<CellularResponse>('/API/info?list=Cellular');
  return normalizeResponse(response);
}

export async function updateCellularConfig(config: CellularConfigRequest): Promise<void> {
  const normalizedConfig: CellularConfigRequest = {
    Cellular: {
      ...config.Cellular,
      RoamingEnabled: toFlag01(config.Cellular.RoamingEnabled),
      InterfaceEnable: toFlag01(config.Cellular.InterfaceEnable)
    }
  };

  if (isDevelopment) {
    console.log('Mock: Updating cellular config', normalizedConfig);
    return;
  }
  await apiClient.post('/API/system', normalizedConfig);
}

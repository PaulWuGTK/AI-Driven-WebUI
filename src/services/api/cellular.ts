import apiClient from '../apiClient';
import type { CellularResponse } from '../../types/cellular';
import { cellularMockData } from '../mockData/cellularMockData';

const isDevelopment = import.meta.env.DEV;

export async function getCellularStatus(): Promise<CellularResponse> {
  if (isDevelopment) {
    return cellularMockData;
  }
  const response = await apiClient.get<CellularResponse>('/API/info?list=Cellular');
  return response;
}

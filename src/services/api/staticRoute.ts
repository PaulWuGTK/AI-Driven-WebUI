import { callApi } from '../apiClient';
import type { StaticRouteResponse, StaticRouteUpdateRequest } from '../../types/staticRoute';
import { getStaticRouteMockData, updateStaticRouteMockData } from '../mockData/staticRouteMockData';

const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = '/API';

export const getStaticRoute = async (): Promise<StaticRouteResponse> => {
  if (isDevelopment) {
    return getStaticRouteMockData();
  }
  return callApi<StaticRouteResponse>(`${API_BASE_URL}/info?list=StaticRoute`);
};

export const updateStaticRoute = async (data: StaticRouteUpdateRequest): Promise<StaticRouteResponse> => {
  if (isDevelopment) {
    return updateStaticRouteMockData(data);
  }
  return callApi<StaticRouteResponse>(`${API_BASE_URL}/info?list=StaticRoute`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

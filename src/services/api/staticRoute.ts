import { callApi } from '../apiClient';
import type { StaticRouteResponse, StaticRouteUpdateRequest } from '../../types/staticRoute';
import { getMockStaticRoute, updateMockStaticRoute } from '../mockApi';

const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = '/API';

export const getStaticRoute = async (): Promise<StaticRouteResponse> => {
  if (isDevelopment) {
    return getMockStaticRoute();
  }
  return callApi<StaticRouteResponse>(`${API_BASE_URL}/info?list=StaticRoute`);
};

export const updateStaticRoute = async (data: StaticRouteUpdateRequest): Promise<StaticRouteResponse> => {
  if (isDevelopment) {
    return updateMockStaticRoute(data);
  }
  return callApi<StaticRouteResponse>(`${API_BASE_URL}/info?list=StaticRoute`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

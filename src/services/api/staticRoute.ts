import apiClient from '../apiClient';
import type { StaticRouteResponse, StaticRouteUpdateRequest } from '../../types/staticRoute';

export const getStaticRoute = async (): Promise<StaticRouteResponse> => {
  const response = await apiClient.get<StaticRouteResponse>('/API/info?list=StaticRoute');
  return response;
};

export const updateStaticRoute = async (data: StaticRouteUpdateRequest): Promise<StaticRouteResponse> => {
  const response = await apiClient.post<StaticRouteResponse>('/API/info?list=StaticRoute', data);
  return response;
};

import { callApi } from '../apiClient';
import type { StaticRouteResponse, StaticRouteUpdateRequest } from '../../types/staticRoute';
import { getStaticRouteMockData, updateStaticRouteMockData } from '../mockData/staticRouteMockData';
import { toFlag01 } from '../flag01';

const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = '/API';

const normalizeResponse = (data: StaticRouteResponse): StaticRouteResponse => ({
  StaticRoute: {
    ...data.StaticRoute,
    IPv4: (data.StaticRoute.IPv4 || []).map((route, index) => ({
      ...route,
      Enable: toFlag01(
        route.Enable,
        0,
        { endpoint: `${API_BASE_URL}/info?list=StaticRoute`, path: `StaticRoute.IPv4.[${index}].Enable` }
      ),
      UsedGWIp: toFlag01(
        route.UsedGWIp,
        0,
        { endpoint: `${API_BASE_URL}/info?list=StaticRoute`, path: `StaticRoute.IPv4.[${index}].UsedGWIp` }
      ),
    })),
    IPv6: (data.StaticRoute.IPv6 || []).map((route, index) => ({
      ...route,
      Enable: toFlag01(
        route.Enable,
        0,
        { endpoint: `${API_BASE_URL}/info?list=StaticRoute`, path: `StaticRoute.IPv6.[${index}].Enable` }
      ),
      UsedGWIp: toFlag01(
        route.UsedGWIp,
        0,
        { endpoint: `${API_BASE_URL}/info?list=StaticRoute`, path: `StaticRoute.IPv6.[${index}].UsedGWIp` }
      ),
    }))
  }
});

const normalizePayload = (data: StaticRouteUpdateRequest): StaticRouteUpdateRequest => ({
  StaticRoute: {
    ...data.StaticRoute,
    IPv4: (data.StaticRoute.IPv4 || []).map((route, index) => ({
      ...route,
      Enable: toFlag01(
        route.Enable,
        0,
        { endpoint: `${API_BASE_URL}/info?list=StaticRoute`, path: `StaticRoute.IPv4.[${index}].Enable` }
      ),
      UsedGWIp: toFlag01(
        route.UsedGWIp,
        0,
        {
          endpoint: `${API_BASE_URL}/info?list=StaticRoute`,
          path: `StaticRoute.IPv4.[${index}].UsedGWIp`,
          reportBoolean: false
        }
      ),
    })),
    IPv6: (data.StaticRoute.IPv6 || []).map((route, index) => ({
      ...route,
      Enable: toFlag01(
        route.Enable,
        0,
        { endpoint: `${API_BASE_URL}/info?list=StaticRoute`, path: `StaticRoute.IPv6.[${index}].Enable` }
      ),
      UsedGWIp: toFlag01(
        route.UsedGWIp,
        0,
        {
          endpoint: `${API_BASE_URL}/info?list=StaticRoute`,
          path: `StaticRoute.IPv6.[${index}].UsedGWIp`,
          reportBoolean: false
        }
      ),
    }))
  }
});

export const getStaticRoute = async (): Promise<StaticRouteResponse> => {
  if (isDevelopment) {
    return normalizeResponse(getStaticRouteMockData());
  }
  const response = await callApi<StaticRouteResponse>(`${API_BASE_URL}/info?list=StaticRoute`);
  return normalizeResponse(response);
};

export const updateStaticRoute = async (data: StaticRouteUpdateRequest): Promise<StaticRouteResponse> => {
  const normalizedData = normalizePayload(data);

  if (isDevelopment) {
    return normalizeResponse(updateStaticRouteMockData(normalizedData));
  }
  const response = await callApi<StaticRouteResponse>(`${API_BASE_URL}/info?list=StaticRoute`, {
    method: 'POST',
    body: JSON.stringify(normalizedData)
  });
  return normalizeResponse(response);
};

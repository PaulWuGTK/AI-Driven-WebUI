import { callApi } from '../apiClient';
import type { StaticRouteData, StaticRouteResponse, StaticRouteUpdateRequest } from '../../types/staticRoute';
import { getStaticRouteMockData, updateStaticRouteMockData } from '../mockData/staticRouteMockData';
import { toFlag01 } from '../flag01';
import { extractNokMessage } from '../../utils/apiUtils';

const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = '/API';

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const parseStaticRouteData = (value: unknown): StaticRouteData | null => {
  if (!isRecord(value)) return null;
  if (!Array.isArray(value.IPv4) || !Array.isArray(value.IPv6)) return null;
  return value as unknown as StaticRouteData;
};

const parseStaticRouteResponse = (payload: unknown): StaticRouteResponse | null => {
  if (!isRecord(payload)) return null;

  // Flat shape:
  // { StaticRoute: { IPv4: [...], IPv6: [...], WanIfList: [...] } }
  const flat = parseStaticRouteData(payload.StaticRoute);
  if (flat) {
    return { StaticRoute: flat };
  }

  // Nested shape:
  // { StaticRoute: { StaticRoute: { IPv4: [...], IPv6: [...], WanIfList: [...] } } }
  if (isRecord(payload.StaticRoute)) {
    const nested = parseStaticRouteData(payload.StaticRoute.StaticRoute);
    if (nested) {
      return { StaticRoute: nested };
    }
  }

  return null;
};

const parseStaticRoutePostStatus = (payload: unknown): { ok: boolean; message?: string } | null => {
  const nok = extractNokMessage(payload);
  if (nok) {
    return { ok: false, message: nok };
  }

  if (!isRecord(payload)) return null;

  if (typeof payload.StaticRoute === 'string') {
    const result = payload.StaticRoute.trim().toUpperCase();
    if (result === 'OK' || result === 'SUCCESS') return { ok: true };
    if (result === 'NOK' || result === 'FAIL' || result === 'FAILED') {
      return { ok: false, message: 'Failed to save static route' };
    }
  }

  if (isRecord(payload.StaticRoute) && typeof payload.StaticRoute.status === 'string') {
    const status = payload.StaticRoute.status.trim().toUpperCase();
    if (status === 'SUCCESS' || status === 'OK') return { ok: true };
    return {
      ok: false,
      message: typeof payload.StaticRoute.error === 'string'
        ? payload.StaticRoute.error
        : payload.StaticRoute.status
    };
  }

  return null;
};

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
  const response = await callApi<unknown>(`${API_BASE_URL}/info?list=StaticRoute`);
  const parsed = parseStaticRouteResponse(response);
  if (!parsed) {
    throw new Error('Invalid StaticRoute response format');
  }
  return normalizeResponse(parsed);
};

export const updateStaticRoute = async (data: StaticRouteUpdateRequest): Promise<StaticRouteResponse> => {
  const normalizedData = normalizePayload(data);

  if (isDevelopment) {
    return normalizeResponse(updateStaticRouteMockData(normalizedData));
  }
  const response = await callApi<unknown>(`${API_BASE_URL}/info?list=StaticRoute`, {
    method: 'POST',
    body: JSON.stringify(normalizedData)
  });

  const parsed = parseStaticRouteResponse(response);
  if (parsed) {
    return normalizeResponse(parsed);
  }

  const status = parseStaticRoutePostStatus(response);
  if (status && !status.ok) {
    throw new Error(status.message || 'Failed to save static route');
  }

  // For status-only responses (e.g. {"StaticRoute":"OK"}), refresh the list from GET.
  return getStaticRoute();
};

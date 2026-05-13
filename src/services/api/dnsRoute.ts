import { callApi } from '../apiClient';
import type { DnsRouteResponse, DnsRouteRule, DnsRouteUpdateRequest } from '../../types/dnsRoute';
import { getDnsRouteMockData, updateDnsRouteMockData } from '../mockData/dnsRouteMockData';
import { toFlag01 } from '../flag01';
import { extractNokMessage } from '../../utils/apiUtils';
import { isOpenWrtWifiLogoMode } from '../../config/runtimeMode';

const isDevelopment = import.meta.env.DEV || isOpenWrtWifiLogoMode;
const API_BASE_URL = '/API';

const normalizeRule = (rule: DnsRouteRule, index: number, reportBoolean = true): DnsRouteRule => ({
  ...rule,
  Enable: toFlag01(
    rule.Enable,
    0,
    {
      endpoint: `${API_BASE_URL}/info?list=DNSRoute`,
      path: `DNSRoute.[${index}].Enable`,
      reportBoolean
    }
  )
});

const normalizeResponse = (data: DnsRouteResponse): DnsRouteResponse => ({
  ...data,
  DNSRoute: (data.DNSRoute || []).map((rule, index) => normalizeRule(rule, index, true))
});

const normalizePayload = (data: DnsRouteUpdateRequest): DnsRouteUpdateRequest => ({
  DNSRoute: (data.DNSRoute || []).map((rule, index) => normalizeRule(rule, index, false))
});

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const parseDnsRouteResponse = (payload: unknown): DnsRouteResponse | null => {
  if (!isRecord(payload)) return null;
  const root = payload;

  // Flat shape:
  // { DNSRoute: [...], WanIfList: [...] }
  if (Array.isArray(root.DNSRoute)) {
    return {
      DNSRoute: root.DNSRoute as DnsRouteRule[],
      WanIfList: Array.isArray(root.WanIfList) ? (root.WanIfList as string[]) : undefined
    };
  }

  // Nested shape:
  // { DNSRoute: { DNSRoute: [...], WanIfList: [...] } }
  if (root.DNSRoute && typeof root.DNSRoute === 'object' && !Array.isArray(root.DNSRoute)) {
    const nested = root.DNSRoute as Record<string, unknown>;
    if (Array.isArray(nested.DNSRoute)) {
      return {
        DNSRoute: nested.DNSRoute as DnsRouteRule[],
        WanIfList: Array.isArray(nested.WanIfList) ? (nested.WanIfList as string[]) : undefined
      };
    }
  }

  return null;
};

const parseDnsRoutePostStatus = (payload: unknown): { ok: boolean; message?: string } | null => {
  const nok = extractNokMessage(payload);
  if (nok) {
    return { ok: false, message: nok };
  }

  if (!isRecord(payload)) return null;

  if (typeof payload.DNSRoute === 'string') {
    const result = payload.DNSRoute.trim().toUpperCase();
    if (result === 'OK' || result === 'SUCCESS') return { ok: true };
    if (result === 'NOK' || result === 'FAIL' || result === 'FAILED') {
      return { ok: false, message: 'Failed to save DNS routes' };
    }
  }

  if (isRecord(payload.DNSRoute) && typeof payload.DNSRoute.status === 'string') {
    const status = payload.DNSRoute.status.trim().toUpperCase();
    if (status === 'SUCCESS' || status === 'OK') return { ok: true };
    return {
      ok: false,
      message: typeof payload.DNSRoute.error === 'string'
        ? payload.DNSRoute.error
        : payload.DNSRoute.status
    };
  }

  return null;
};

export const getDnsRoute = async (): Promise<DnsRouteResponse> => {
  if (isDevelopment) {
    return normalizeResponse(getDnsRouteMockData());
  }

  const response = await callApi<unknown>(`${API_BASE_URL}/info?list=DNSRoute`);
  const parsed = parseDnsRouteResponse(response);
  if (!parsed) {
    throw new Error('Invalid DNSRoute response format');
  }
  return normalizeResponse(parsed);
};

export const updateDnsRoute = async (data: DnsRouteUpdateRequest): Promise<DnsRouteResponse> => {
  const normalizedData = normalizePayload(data);

  if (isDevelopment) {
    return normalizeResponse(updateDnsRouteMockData(normalizedData));
  }

  const response = await callApi<unknown>(`${API_BASE_URL}/info?list=DNSRoute`, {
    method: 'POST',
    body: JSON.stringify(normalizedData)
  });

  const parsed = parseDnsRouteResponse(response);
  if (parsed) {
    return normalizeResponse(parsed);
  }

  const status = parseDnsRoutePostStatus(response);
  if (status && !status.ok) {
    throw new Error(status.message || 'Failed to save DNS routes');
  }

  // For status-only responses (e.g. {"DNSRoute":"OK"}), refresh the list from GET.
  return getDnsRoute();
};

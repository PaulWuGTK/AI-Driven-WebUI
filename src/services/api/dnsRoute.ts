import { callApi } from '../apiClient';
import type { DnsRouteResponse, DnsRouteRule, DnsRouteUpdateRequest } from '../../types/dnsRoute';
import { getDnsRouteMockData, updateDnsRouteMockData } from '../mockData/dnsRouteMockData';
import { toFlag01 } from '../flag01';

const isDevelopment = import.meta.env.DEV;
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

export const getDnsRoute = async (): Promise<DnsRouteResponse> => {
  if (isDevelopment) {
    return normalizeResponse(getDnsRouteMockData());
  }

  const response = await callApi<DnsRouteResponse>(`${API_BASE_URL}/info?list=DNSRoute`);
  return normalizeResponse(response);
};

export const updateDnsRoute = async (data: DnsRouteUpdateRequest): Promise<DnsRouteResponse> => {
  const normalizedData = normalizePayload(data);

  if (isDevelopment) {
    return normalizeResponse(updateDnsRouteMockData(normalizedData));
  }

  const response = await callApi<DnsRouteResponse>(`${API_BASE_URL}/info?list=DNSRoute`, {
    method: 'POST',
    body: JSON.stringify(normalizedData)
  });

  return normalizeResponse(response);
};

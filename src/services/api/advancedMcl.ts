import { callApi } from '../apiClient';
import type {
  AdvancedMclMGMTResponse,
  AdvancedMclMGMTUpdateRequest,
  AdvancedMclServiceMap,
  AdvancedMclServiceName,
  AdvancedMclTrustDomainResponse,
  AdvancedMclTrustDomainUpdateRequest,
  AdvancedMclWanAccessMode,
} from '../../types/advancedMcl';
import {
  getAdvancedMclMGMTMockData,
  getAdvancedMclTrustDomainMockData,
  updateAdvancedMclMGMTMockData,
  updateAdvancedMclTrustDomainMockData,
} from '../mockData/advancedMclMockData';

const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = '/API';

const SERVICE_ORDER: AdvancedMclServiceName[] = [
  'HTTP',
  'HTTPS',
  'FTP',
  'TELNET',
  'SSH',
  'PING',
  'TFTP',
];

const DEFAULT_READ_ONLY = {
  HTTP: [],
  HTTPS: [],
  FTP: [],
  TELNET: [],
  SSH: [],
  PING: [],
  TFTP: [],
};

const toBoolean = (value: unknown): boolean => {
  if (value === true || value === 1 || value === '1') return true;
  if (value === false || value === 0 || value === '0') return false;
  return false;
};

const normalizeWanAccessMode = (value: unknown): AdvancedMclWanAccessMode =>
  value === 'AnyWAN' ? 'AnyWAN' : 'MultipleWAN';

const unwrapMgmtSource = (raw: unknown): Partial<AdvancedMclMGMTResponse['AdvancedMclMGMT']> => {
  if (!raw || typeof raw !== 'object') return {};

  const top = raw as { AdvancedMclMGMT?: unknown };
  const firstLevel = top.AdvancedMclMGMT;
  if (!firstLevel || typeof firstLevel !== 'object') return {};

  // Some backends return { AdvancedMclMGMT: { AdvancedMclMGMT: { ... } } } after POST.
  const nested = (firstLevel as { AdvancedMclMGMT?: unknown }).AdvancedMclMGMT;
  if (nested && typeof nested === 'object') {
    return nested as Partial<AdvancedMclMGMTResponse['AdvancedMclMGMT']>;
  }

  return firstLevel as Partial<AdvancedMclMGMTResponse['AdvancedMclMGMT']>;
};

const normalizeMgmtResponse = (raw: AdvancedMclMGMTResponse): AdvancedMclMGMTResponse => {
  const source = unwrapMgmtSource(raw);

  const normalizedServices = {} as AdvancedMclServiceMap;
  for (const serviceName of SERVICE_ORDER) {
    const service = source.Services?.[serviceName];
    normalizedServices[serviceName] = {
      LAN: toBoolean(service?.LAN),
      WAN: toBoolean(service?.WAN),
      TrustDomain: toBoolean(service?.TrustDomain),
      Port: String(service?.Port ?? ''),
    };
  }

  return {
    AdvancedMclMGMT: {
      WanAccessMode: normalizeWanAccessMode(source.WanAccessMode),
      WanAccessInterfaces: Array.isArray(source.WanAccessInterfaces)
        ? source.WanAccessInterfaces.map((item) => String(item))
        : [],
      Services: normalizedServices,
      ReadOnly: {
        ...DEFAULT_READ_ONLY,
        ...(source.ReadOnly || {}),
      },
    },
  };
};

export const getAdvancedMclMGMT = async (): Promise<AdvancedMclMGMTResponse> => {
  if (isDevelopment) {
    return normalizeMgmtResponse(getAdvancedMclMGMTMockData());
  }

  const response = await callApi<AdvancedMclMGMTResponse>(`${API_BASE_URL}/info?list=AdvancedMclMGMT`);
  return normalizeMgmtResponse(response);
};

export const updateAdvancedMclMGMT = async (
  payload: AdvancedMclMGMTUpdateRequest
): Promise<AdvancedMclMGMTResponse> => {
  if (isDevelopment) {
    return normalizeMgmtResponse(updateAdvancedMclMGMTMockData(payload));
  }

  const response = await callApi<AdvancedMclMGMTResponse>(`${API_BASE_URL}/info?list=AdvancedMclMGMT`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeMgmtResponse(response);
};

const normalizeTrustDomainResponse = (
  raw: AdvancedMclTrustDomainResponse
): AdvancedMclTrustDomainResponse => ({
  AdvancedMclTrustDomain: Array.isArray(raw.AdvancedMclTrustDomain)
    ? raw.AdvancedMclTrustDomain.map((entry) => String(entry))
    : [],
});

export const getAdvancedMclTrustDomain = async (): Promise<AdvancedMclTrustDomainResponse> => {
  if (isDevelopment) {
    return normalizeTrustDomainResponse(getAdvancedMclTrustDomainMockData());
  }

  const response = await callApi<AdvancedMclTrustDomainResponse>(
    `${API_BASE_URL}/info?list=AdvancedMclTrustDomain`
  );
  return normalizeTrustDomainResponse(response);
};

export const updateAdvancedMclTrustDomain = async (
  payload: AdvancedMclTrustDomainUpdateRequest
): Promise<AdvancedMclTrustDomainResponse> => {
  if (isDevelopment) {
    return normalizeTrustDomainResponse(updateAdvancedMclTrustDomainMockData(payload));
  }

  const response = await callApi<AdvancedMclTrustDomainResponse>(
    `${API_BASE_URL}/info?list=AdvancedMclTrustDomain`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return normalizeTrustDomainResponse(response);
};

export const ADVANCED_MCL_SERVICE_ORDER = SERVICE_ORDER;

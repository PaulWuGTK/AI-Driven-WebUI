import { callApi } from '../apiClient';
import { isOpenWrtWifiLogoMode } from '../../config/runtimeMode';
import type {
  AdvancedMclMGMTResponse,
  AdvancedMclMGMTUpdateRequest,
  AdvancedMclServiceMap,
  AdvancedMclServiceName,
  AdvancedMclTrustDomainResponse,
  AdvancedMclTrustDomainUpdateRequest,
  AdvancedMclWanAccessMode,
} from '../../types/advancedMcl';
import { toFlag01 } from '../flag01';
import {
  getAdvancedMclMGMTMockData,
  getAdvancedMclTrustDomainMockData,
  updateAdvancedMclMGMTMockData,
  updateAdvancedMclTrustDomainMockData,
} from '../mockData/advancedMclMockData';

const isDevelopment = import.meta.env.DEV || isOpenWrtWifiLogoMode;
const API_BASE_URL = '/API';
const MGMT_ENDPOINT = `${API_BASE_URL}/info?list=AdvancedMclMGMT`;

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
      LAN: toFlag01(service?.LAN, 0, {
        endpoint: MGMT_ENDPOINT,
        path: `AdvancedMclMGMT.Services.${serviceName}.LAN`,
      }),
      WAN: toFlag01(service?.WAN, 0, {
        endpoint: MGMT_ENDPOINT,
        path: `AdvancedMclMGMT.Services.${serviceName}.WAN`,
      }),
      TrustDomain: toFlag01(service?.TrustDomain, 0, {
        endpoint: MGMT_ENDPOINT,
        path: `AdvancedMclMGMT.Services.${serviceName}.TrustDomain`,
      }),
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

const normalizeMgmtPayload = (payload: AdvancedMclMGMTUpdateRequest): AdvancedMclMGMTUpdateRequest => {
  const normalizedServices = {} as AdvancedMclServiceMap;
  for (const serviceName of SERVICE_ORDER) {
    const service = payload.AdvancedMclMGMT.Services?.[serviceName];
    normalizedServices[serviceName] = {
      LAN: toFlag01(service?.LAN, 0, {
        endpoint: MGMT_ENDPOINT,
        path: `AdvancedMclMGMT.Services.${serviceName}.LAN`,
        reportBoolean: false,
      }),
      WAN: toFlag01(service?.WAN, 0, {
        endpoint: MGMT_ENDPOINT,
        path: `AdvancedMclMGMT.Services.${serviceName}.WAN`,
        reportBoolean: false,
      }),
      TrustDomain: toFlag01(service?.TrustDomain, 0, {
        endpoint: MGMT_ENDPOINT,
        path: `AdvancedMclMGMT.Services.${serviceName}.TrustDomain`,
        reportBoolean: false,
      }),
      Port: String(service?.Port ?? ''),
    };
  }

  return {
    AdvancedMclMGMT: {
      WanAccessMode: normalizeWanAccessMode(payload.AdvancedMclMGMT.WanAccessMode),
      WanAccessInterfaces: Array.isArray(payload.AdvancedMclMGMT.WanAccessInterfaces)
        ? payload.AdvancedMclMGMT.WanAccessInterfaces.map((entry) => String(entry))
        : [],
      Services: normalizedServices,
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
  const normalizedPayload = normalizeMgmtPayload(payload);

  if (isDevelopment) {
    return normalizeMgmtResponse(updateAdvancedMclMGMTMockData(normalizedPayload));
  }

  const response = await callApi<AdvancedMclMGMTResponse>(MGMT_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(normalizedPayload),
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

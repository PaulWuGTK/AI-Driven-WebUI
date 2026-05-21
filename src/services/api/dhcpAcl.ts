import type {
  DHCPACLMatchLogic,
  DHCPACLRawConfig,
  DHCPACLResponse,
  DHCPACLUpdatePayload,
  DHCPACLUpdateRequest
} from '../../types/dhcpAcl';
import { dhcpAclMockData } from '../mockData/dhcpAclMockData';
import { callApi } from '../apiClient';

const API_URL = '/API/info?list=DHCPACL';
const isDevelopment = import.meta.env.DEV;

const toBool01 = (value: unknown): boolean => {
  if (value === 1 || value === '1' || value === true) return true;
  if (value === 0 || value === '0' || value === false) return false;
  return false;
};

const toInt01 = (value: unknown): 0 | 1 => (value ? 1 : 0);

const toMatchLogic = (value: unknown): DHCPACLMatchLogic => {
  return value === 'or' ? 'or' : 'and';
};

const getRawConfig = (raw: { DHCPACL?: DHCPACLRawConfig | DHCPACLRawConfig[] }): DHCPACLRawConfig => {
  const config = Array.isArray(raw.DHCPACL) ? raw.DHCPACL[0] : raw.DHCPACL;
  return config ?? dhcpAclMockData.DHCPACL;
};

const normalizeResponse = (raw: { DHCPACL?: DHCPACLRawConfig | DHCPACLRawConfig[] }): DHCPACLResponse => {
  const config = getRawConfig(raw);

  return {
    DHCPACL: {
      Enable: toBool01(config.Enable),
      MatchLogic: toMatchLogic(config.MatchLogic),
      Option60: toBool01(config.Option60),
      VendorClassID: config.VendorClassID ?? '',
      Option61: toBool01(config.Option61),
      ClientIdentifier: config.ClientIdentifier ?? '',
      ListMatchLogic: config.ListMatchLogic || 'and,or'
    }
  };
};

const buildPayload = (request: DHCPACLUpdateRequest): DHCPACLUpdatePayload => ({
  DHCPACL: {
    Enable: toInt01(request.DHCPACL.Enable),
    MatchLogic: toMatchLogic(request.DHCPACL.MatchLogic),
    Option60: toInt01(request.DHCPACL.Option60),
    VendorClassID: request.DHCPACL.VendorClassID,
    Option61: toInt01(request.DHCPACL.Option61),
    ClientIdentifier: request.DHCPACL.ClientIdentifier
  }
});

export const getDHCPACL = async (): Promise<DHCPACLResponse> => {
  if (isDevelopment) {
    return normalizeResponse(dhcpAclMockData);
  }

  const response = await callApi<{ DHCPACL: DHCPACLRawConfig | DHCPACLRawConfig[] }>(API_URL);
  return normalizeResponse(response);
};

export const updateDHCPACL = async (data: DHCPACLUpdateRequest): Promise<DHCPACLResponse> => {
  const payload = buildPayload(data);

  if (isDevelopment) {
    dhcpAclMockData.DHCPACL = {
      ...payload.DHCPACL,
      ListMatchLogic: dhcpAclMockData.DHCPACL.ListMatchLogic || 'and,or'
    };
    return normalizeResponse(dhcpAclMockData);
  }

  const raw = await callApi<{ DHCPACL: DHCPACLRawConfig | DHCPACLRawConfig[] }>(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeResponse(raw);
};

import type { BasicWanInterface, BasicWanResponse, BasicWanUpdateRequest } from '../../types/basicWan';
import { callApi } from '../apiClient';
import { toFlag01 } from '../flag01';

const isDevelopment = import.meta.env.DEV;

const normalizeInterface = (iface: BasicWanInterface): BasicWanInterface => {
  const flagFields: (keyof BasicWanInterface)[] = [
    'IPv4Enable', 'IPv6Enable',
    'Option60', 'Option61', 'Option12',
    'SLAAC', 'IANA', 'IAPD'
  ];
  const result = { ...iface } as Record<string, unknown>;
  for (const field of flagFields) {
    if (field in result) {
      result[field] = toFlag01(result[field]);
    }
  }
  return result as unknown as BasicWanInterface;
};

export const getBasicWan = async (): Promise<BasicWanResponse> => {
  if (isDevelopment) {
    const { basicWanMockData } = await import('../mockData/basicWanMockData');
    return JSON.parse(JSON.stringify(basicWanMockData));
  }
  const response = await callApi<BasicWanResponse>('/API/info?list=BasicWan');
  return {
    ...response,
    BasicWan: {
      ...response.BasicWan,
      Interfaces: response.BasicWan.Interfaces.map(iface => normalizeInterface(iface))
    }
  };
};

export const updateBasicWan = async (data: BasicWanUpdateRequest): Promise<BasicWanResponse> => {
  const normalized: BasicWanUpdateRequest = {
    BasicWan: {
      Interfaces: data.BasicWan.Interfaces.map(iface => normalizeInterface(iface))
    }
  };
  if (isDevelopment) {
    console.log('Update BasicWan:', normalized);
    return {
      BasicWan: {
        ListIPv4Mode: [],
        ListIPv6Mode: [],
        ListOperationMode: [],
        ListVLANType: [],
        ListConnectionTrigger: [],
        ...normalized.BasicWan
      }
    } as BasicWanResponse;
  }
  return callApi<BasicWanResponse>('/API/info?list=BasicWan', {
    method: 'POST',
    body: JSON.stringify(normalized),
  });
};

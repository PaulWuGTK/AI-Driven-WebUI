import type {
  AdvancedMclMGMTResponse,
  AdvancedMclMGMTUpdateRequest,
  AdvancedMclTrustDomainResponse,
  AdvancedMclTrustDomainUpdateRequest,
} from '../../types/advancedMcl';

let mgmtMockData: AdvancedMclMGMTResponse = {
  AdvancedMclMGMT: {
    WanAccessMode: 'MultipleWAN',
    WanAccessInterfaces: ['IPoE', 'PPPoE', 'Bridge'],
    Services: {
      HTTP: { LAN: 1, WAN: 0, TrustDomain: 1, Port: '80' },
      HTTPS: { LAN: 1, WAN: 0, TrustDomain: 1, Port: '443' },
      FTP: { LAN: 1, WAN: 0, TrustDomain: 1, Port: '21' },
      TELNET: { LAN: 1, WAN: 0, TrustDomain: 1, Port: '23' },
      SSH: { LAN: 1, WAN: 0, TrustDomain: 1, Port: '22' },
      PING: { LAN: 1, WAN: 0, TrustDomain: 1, Port: '' },
      TFTP: { LAN: 1, WAN: 0, TrustDomain: 1, Port: '69' },
    },
    ReadOnly: {
      HTTP: ['LAN', 'WAN', 'TrustDomain', 'Port'],
      HTTPS: ['WAN', 'Port'],
      FTP: ['WAN', 'Port'],
      TELNET: ['WAN', 'Port'],
      SSH: ['Port'],
      PING: ['WAN', 'Port'],
      TFTP: ['WAN', 'TrustDomain', 'Port'],
    },
  },
};

let trustDomainMockData: AdvancedMclTrustDomainResponse = {
  AdvancedMclTrustDomain: [
    '10.254.254.0/24',
    '10.255.255.254/32',
    '172.17.187.32/27',
    '172.26.255.232/30',
  ],
};

export const getAdvancedMclMGMTMockData = (): AdvancedMclMGMTResponse =>
  JSON.parse(JSON.stringify(mgmtMockData));

export const updateAdvancedMclMGMTMockData = (
  payload: AdvancedMclMGMTUpdateRequest
): AdvancedMclMGMTResponse => {
  mgmtMockData = {
    AdvancedMclMGMT: {
      ...payload.AdvancedMclMGMT,
      ReadOnly: mgmtMockData.AdvancedMclMGMT.ReadOnly,
    },
  };
  return getAdvancedMclMGMTMockData();
};

export const getAdvancedMclTrustDomainMockData = (): AdvancedMclTrustDomainResponse =>
  JSON.parse(JSON.stringify(trustDomainMockData));

export const updateAdvancedMclTrustDomainMockData = (
  payload: AdvancedMclTrustDomainUpdateRequest
): AdvancedMclTrustDomainResponse => {
  trustDomainMockData = {
    AdvancedMclTrustDomain: [...payload.AdvancedMclTrustDomain],
  };
  return getAdvancedMclTrustDomainMockData();
};

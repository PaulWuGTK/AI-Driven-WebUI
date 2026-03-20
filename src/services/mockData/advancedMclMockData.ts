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
      HTTP: { LAN: true, WAN: false, TrustDomain: true, Port: '80' },
      HTTPS: { LAN: true, WAN: false, TrustDomain: true, Port: '443' },
      FTP: { LAN: true, WAN: false, TrustDomain: true, Port: '21' },
      TELNET: { LAN: true, WAN: false, TrustDomain: true, Port: '23' },
      SSH: { LAN: true, WAN: false, TrustDomain: true, Port: '22' },
      PING: { LAN: true, WAN: false, TrustDomain: true, Port: '' },
      TFTP: { LAN: true, WAN: false, TrustDomain: true, Port: '69' },
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

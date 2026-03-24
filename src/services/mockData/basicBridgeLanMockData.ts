import type { BasicBridgeLanResponse } from '../../types/basicBridgeLan';

export const basicBridgeLanMockData: BasicBridgeLanResponse = {
  BasicBridgeLan: {
    IPv4Enable: 1,
    IPv4Protocol: 'DHCP',
    IPv4Address: '192.168.1.1',
    SubnetMask: '255.255.255.0',
    IPv6Enable: 1,
    IPv6Protocol: 'AutoConfigured',
    IPv6Address: 'fc00::5a13:d3ff:fea3:b851',
    IPv6Prefix: 'fc00::/64',
    ListIPv4Protocol: ['DHCP', 'Static'],
    ListIPv6Protocol: ['AutoConfigured', 'DHCPv6', 'Static']
  }
};

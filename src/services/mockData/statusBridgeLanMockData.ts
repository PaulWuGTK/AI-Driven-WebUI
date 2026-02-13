import type { StatusBridgeLanResponse } from '../../types/statusBridgeLan';

export const statusBridgeLanMockData: StatusBridgeLanResponse = {
  StatusBridgeLan: {
    IPv4Protocol: 'DHCP',
    IPv4Address: '192.168.1.1',
    SubnetMask: '255.255.255.0',
    IPv4Status: 'Disabled',
    MACAddress: '58:13:D3:A3:B8:51',
    IPv6Protocol: 'AutoConfigured',
    IPv6Address: 'fc00::5a13:d3ff:fea3:b851',
    IPv6Prefix: 'fc00::/64',
    IPv6Status: 'Enabled'
  }
};

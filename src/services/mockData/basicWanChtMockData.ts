import type { BasicWanChtResponse } from '../../types/basicWanCht';

export const basicWanChtMockData: BasicWanChtResponse = {
  BasicWanCht: {
    PPPoE: {
      Enable: true,
      Protocol: 'PPPoE',
      Username: 'test@hinet.net',
      Password: 'password123',
      ServiceName: '',
      ConnectionType: 'AlwaysConnected',
      IdleTime: 0,
      MTU: 1492,
      DefaultGateway: true,
      PassThrough: false,
      IPv4: true,
      IPv6: false,
      DNSMode: 'Auto',
      PrimaryDNS: '',
      SecondaryDNS: '',
      NAT: true,
      IGMP: false,
      VLAN: false,
      VLANPriority: 0,
      VLANID: 0
    },
    IPoE: {
      Enable: false,
      Protocol: 'DHCP',
      MTU: 1500,
      IPv4: true,
      IPv6: false,
      Option60: false,
      VendorID: '',
      Option61: false,
      DUID: '000300015813D3A3B857',
      DNSMode: 'Auto',
      PrimaryDNS: '',
      SecondaryDNS: '',
      NAT: false,
      IGMP: false,
      VLAN: true,
      VLANPriority: 0,
      VLANID: 110,
      IPAddress: '',
      SubnetMask: '',
      Gateway: ''
    },
    Bridge: {
      Enable: false,
      Protocol: 'Bridge',
      MTU: 1500,
      SupportedLANInterfaces: ['eth1', 'eth2', 'eth3'],
      LANInterfaces: ['eth1'],
      VLAN: true,
      VLANPriority: 0,
      VLANID: 120
    }
  }
};

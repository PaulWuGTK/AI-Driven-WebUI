import type { BasicWanChtResponse } from '../../types/basicWanCht';

export const basicWanChtMockData: BasicWanChtResponse = {
  BasicWanCht: {
    PPPoE: {
      Enable: false,
      Protocol: 'PPPoE',
      Username: 'test',
      Password: 'pass',
      ServiceName: '',
      ConnectionTrigger: 'AlwaysOn',
      IdleTime: 0,
      MTU: 1492,
      DefaultGateway: true,
      PassthroughEnable: false,
      IPv4Enable: true,
      IPv6Enable: false,
      DNSMode: 'Auto',
      PrimaryDNS: '',
      SecondaryDNS: '',
      NATEnable: true,
      IGMPEnable: false,
      VLANEnable: false,
      VLANPriority: 0,
      VLANID: 0,
      ListConnectionTrigger: ['AlwaysOn', 'OnDemand'],
      ListDNSMode: ['Auto', 'Manual']
    },
    IPoE: {
      Enable: false,
      Protocol: 'DHCP',
      MTU: 1500,
      IPv4Enable: true,
      IPv6Enable: false,
      Option60Enable: false,
      Option60Value: '',
      Option61Enable: false,
      Option61Value: '000300015813D3A3B857',
      DNSMode: 'Auto',
      PrimaryDNS: '',
      SecondaryDNS: '',
      NATEnable: false,
      IGMPEnable: false,
      VLANEnable: false,
      VLANPriority: 0,
      VLANID: 0,
      IPAddress: '',
      SubnetMask: '',
      Gateway: '',
      ListProtocol: ['DHCP', 'Static'],
      ListDNSMode: ['Auto', 'Manual']
    },
    Bridge: {
      Enable: false,
      Protocol: 'Bridge',
      MTU: 1500,
      VLANEnable: false,
      VLANPriority: 0,
      VLANID: 0,
      ListSupportedLANInterfaces: ['eth1'],
      ListLANInterfaces: ['eth1']
    }
  }
};

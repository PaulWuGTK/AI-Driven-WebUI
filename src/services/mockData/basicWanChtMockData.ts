import type { BasicWanChtResponse } from '../../types/basicWanCht';

export const basicWanChtMockData: BasicWanChtResponse = {
  BasicWanCht: {
    PPPoE: {
      Enable: 0,
      Protocol: 'PPPoE',
      UserName: 'test',
      Password: 'pass',
      ServiceName: '',
      ConnectionTrigger: 'AlwaysOn',
      IdleTime: 0,
      MTU: 1492,
      DefaultGateway: 1,
      PassthroughEnable: 0,
      IPv4Enable: 1,
      IPv6Enable: 0,
      DNSMode: 'Auto',
      PrimaryDNS: '',
      SecondaryDNS: '',
      NATEnable: 1,
      IGMPEnable: 0,
      VLANEnable: 0,
      VLANPriority: 0,
      VLANID: 0,
      ListConnectionTrigger: ['AlwaysOn', 'OnDemand'],
      ListDNSMode: ['Auto', 'Manual']
    },
    IPoE: {
      Enable: 1,
      Protocol: 'DHCP',
      MTU: 1500,
      DefaultGateway: 0,
      IPv4Enable: 1,
      IPv6Enable: 0,
      DHCPv4Option60Enable: 0,
      DHCPv4Option60Value: '',
      DHCPv4Option61Enable: 0,
      IAID: '',
      DUIDType: '',
      EnterpriseNumber: '',
      Identifier: '',
      DNSMode: 'Auto',
      PrimaryDNS: '',
      SecondaryDNS: '',
      NATEnable: 0,
      IGMPEnable: 0,
      VLANEnable: 0,
      VLANPriority: 0,
      VLANID: 0,
      IPAddress: '',
      SubnetMask: '',
      Gateway: '',
      ListProtocol: ['DHCP', 'Static'],
      ListDNSMode: ['Auto', 'Manual']
    },
    Bridge: {
      Enable: 0,
      Protocol: 'Bridge',
      MTU: 1500,
      VLANEnable: 0,
      VLANPriority: 0,
      VLANID: 0,
      ListSupportedLANInterfaces: ['eth1'],
      ListLANInterfaces: ['eth1']
    }
  }
};

export interface BasicWanChtPPPoE {
  Enable: 0 | 1;
  Protocol: string;
  UserName: string;
  Password: string;
  ServiceName: string;
  ConnectionTrigger: string;
  IdleTime: number;
  MTU: number;
  DefaultGateway: 0 | 1;
  PassthroughEnable: 0 | 1;
  IPv4Enable: 0 | 1;
  IPv6Enable: 0 | 1;
  DNSMode: string;
  PrimaryDNS: string;
  SecondaryDNS: string;
  NATEnable: 0 | 1;
  IGMPEnable: 0 | 1;
  VLANEnable: 0 | 1;
  VLANPriority: number;
  VLANID: number;
  ListConnectionTrigger?: string[];
  ListDNSMode?: string[];
}

export interface BasicWanChtIPoE {
  Enable: 0 | 1;
  Protocol: string;
  MTU: number;
  DefaultGateway: 0 | 1;
  IPv4Enable: 0 | 1;
  IPv6Enable: 0 | 1;
  DHCPv4Option60Enable: 0 | 1;
  DHCPv4Option60Value: string;
  DHCPv4Option61Enable: 0 | 1;
  IAID: string;
  DUIDType: string;
  EnterpriseNumber: string;
  Identifier: string;
  DNSMode: string;
  PrimaryDNS: string;
  SecondaryDNS: string;
  NATEnable: 0 | 1;
  IGMPEnable: 0 | 1;
  VLANEnable: 0 | 1;
  VLANPriority: number;
  VLANID: number;
  IPAddress: string;
  SubnetMask: string;
  Gateway: string;
  ListProtocol?: string[];
  ListDNSMode?: string[];
}

export interface BasicWanChtBridge {
  Enable: 0 | 1;
  Protocol: string;
  MTU: number;
  VLANEnable: 0 | 1;
  VLANPriority: number;
  VLANID: number;
  ListSupportedLANInterfaces?: string[];
  ListLANInterfaces: string[];
}

export interface BasicWanChtConfig {
  PPPoE: BasicWanChtPPPoE;
  IPoE: BasicWanChtIPoE;
  Bridge: BasicWanChtBridge;
}

export interface BasicWanChtResponse {
  BasicWanCht: BasicWanChtConfig;
}

export interface BasicWanChtTableRow {
  type: 'PPPoE' | 'IPoE' | 'Bridge';
  status: 'Up' | 'Down';
  description: string;
  defaultGateway: 0 | 1;
  vlanType: string;
  vlanId: number | string;
  protocol: string;
}

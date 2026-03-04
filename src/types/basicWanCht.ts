export interface BasicWanChtPPPoE {
  Enable: boolean;
  Protocol: string;
  UserName: string;
  Password: string;
  ServiceName: string;
  ConnectionTrigger: string;
  IdleTime: number;
  MTU: number;
  DefaultGateway: boolean;
  PassthroughEnable: boolean;
  IPv4Enable: boolean;
  IPv6Enable: boolean;
  DNSMode: string;
  PrimaryDNS: string;
  SecondaryDNS: string;
  NATEnable: boolean;
  IGMPEnable: boolean;
  VLANEnable: boolean;
  VLANPriority: number;
  VLANID: number;
  ListConnectionTrigger?: string[];
  ListDNSMode?: string[];
}

export interface BasicWanChtIPoE {
  Enable: boolean;
  Protocol: string;
  MTU: number;
  DefaultGateway: boolean;
  IPv4Enable: boolean;
  IPv6Enable: boolean;
  DHCPv4Option60Enable: boolean;
  DHCPv4Option60Value: string;
  DHCPv4Option61Enable: boolean;
  IAID: string;
  DUIDType: string;
  EnterpriseNumber: string;
  Identifier: string;
  DNSMode: string;
  PrimaryDNS: string;
  SecondaryDNS: string;
  NATEnable: boolean;
  IGMPEnable: boolean;
  VLANEnable: boolean;
  VLANPriority: number;
  VLANID: number;
  IPAddress: string;
  SubnetMask: string;
  Gateway: string;
  ListProtocol?: string[];
  ListDNSMode?: string[];
}

export interface BasicWanChtBridge {
  Enable: boolean;
  Protocol: string;
  MTU: number;
  VLANEnable: boolean;
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
  defaultGateway: boolean;
  vlanType: string;
  vlanId: number | string;
  protocol: string;
}

export interface BasicWanChtPPPoE {
  Enable: boolean;
  Protocol: string;
  Username: string;
  Password: string;
  ServiceName: string;
  ConnectionType: string;
  IdleTime: number;
  MTU: number;
  DefaultGateway: boolean;
  PassThrough: boolean;
  IPv4: boolean;
  IPv6: boolean;
  DNSMode: string;
  PrimaryDNS: string;
  SecondaryDNS: string;
  NAT: boolean;
  IGMP: boolean;
  VLAN: boolean;
  VLANPriority: number;
  VLANID: number;
}

export interface BasicWanChtIPoE {
  Enable: boolean;
  Protocol: string;
  MTU: number;
  IPv4: boolean;
  IPv6: boolean;
  Option60: boolean;
  VendorID: string;
  Option61: boolean;
  DUID: string;
  DNSMode: string;
  PrimaryDNS: string;
  SecondaryDNS: string;
  NAT: boolean;
  IGMP: boolean;
  VLAN: boolean;
  VLANPriority: number;
  VLANID: number;
  IPAddress: string;
  SubnetMask: string;
  Gateway: string;
}

export interface BasicWanChtBridge {
  Enable: boolean;
  Protocol: string;
  MTU: number;
  SupportedLANInterfaces: string[];
  LANInterfaces: string[];
  VLAN: boolean;
  VLANPriority: number;
  VLANID: number;
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

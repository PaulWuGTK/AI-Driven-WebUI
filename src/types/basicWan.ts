export interface BasicWanInterface {
  Interface: string;
  // Common
  VLANType: string;
  VLANID: number;
  VLANPriority: number;
  MTU: number;
  // IPv4
  IPv4Enable: 0 | 1;
  IPv4Mode: string;
  IPv4Address: string;
  IPv4SubnetMask: string;
  IPv4DefaultRouter: string;
  IPv4DNSServers: string;
  // IPv4 - DHCP options
  HostName: string;
  Option60: 0 | 1;
  VendorClassID: string;
  Option61: 0 | 1;
  ClientID: string;
  Option12: 0 | 1;
  // IPv4 - PPPoE
  UserName: string;
  Password: string;
  ServiceName: string;
  Contrigger: string;
  IdleTime: number;
  // IPv6
  IPv6Enable: 0 | 1;
  IPv6Mode: string;
  IPv6Address: string;
  IPv6PrefixLength: number;
  IPv6DefaultRouter: string;
  IPv6DNSServers: string;
  SLAAC: 0 | 1;
  IANA: 0 | 1;
  IAPD: 0 | 1;
}

export interface BasicWanResponse {
  BasicWan: {
    ListIPv4Mode: string[];
    ListIPv6Mode: string[];
    ListOperationMode: string[];
    ListVLANType: string[];
    ListConnectionTrigger: string[];
    Interfaces: BasicWanInterface[];
  };
}

export interface BasicWanUpdateRequest {
  BasicWan: {
    Interfaces: BasicWanInterface[];
  };
}

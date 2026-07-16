export interface StaticIPv4Address {
  DNSServers: string;
  DefaultRouter: string;
  IPv4Address: string;
  SubnetMask: string;
}

export interface StaticIPv6Address {
  DNSServers: string;
  DefaultRouter: string;
  IPv6Address: string;
  PrefixLength: number;
}

export interface WanInterface {
  Interface: string;
  IPv4Mode: string;
  IPv6Mode: string;
  PPPoEUserName: string;
  PPPoEPassword: string;
  ConnectionTrigger: string;
  ServiceName: string;
  IdleTime: number;
  VLANType: string;
  VLANID: number;
  VLANPriority: number;
  MTU: number;
  StaticIPv4Address?: StaticIPv4Address;
  StaticIPv6Address?: StaticIPv6Address;
}

export interface WanModeConfig {
  WANMode: string;
  Status: string;
  PhysicalType: string;
  EnableSensing: number;
  DNSMode: string;
  IPv6DNSMode: string;
  Interfaces: WanInterface[];
}

export interface WanModeManagementData {
  ListPhysicalType: string[];
  ListInterface: string[];
  ListDNSMode: string[];
  ListIPv6DNSMode: string[];
  ListIPv4Mode: string[];
  ListIPv6Mode: string[];
  ListVLANType: string[];
  ListConnectionTrigger: string[];
  Profiles: WanModeConfig[];
}

export interface WanModeManagementResponse {
  WanModeManagement: WanModeManagementData;
}

export interface WanModeManagementUpdateRequest {
  WanModeManagement: {
    Profiles: WanModeConfig[];
  };
}

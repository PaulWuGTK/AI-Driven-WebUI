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
  PrefixLength: string;
}

export interface WanInterface {
  Interface: string;
  IPv4Mode: string;
  IPv6Mode: string;
  PPPoEUserName: string;
  PPPoEPassword: string;
  VLANType: string;
  VLANID: string;
  VLANPriority: string;
  StaticIPv4Address?: StaticIPv4Address;
  StaticIPv6Address?: StaticIPv6Address;
}

export interface WanModeConfig {
  WANMode: string;
  Status: string;
  PhysicalType: string;
  Interfaces: WanInterface[];
}

export interface WanModeManagementResponse {
  WanModeManagement: WanModeConfig[];
}

export interface WanModeManagementUpdateRequest {
  WanModeManagement: Omit<WanModeConfig, 'Status'>[];
}
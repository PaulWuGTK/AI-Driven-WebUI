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
  Interface: "wan" | "voip" | "mgmt" | "iptv";
  IPv4Mode: "dhcp4" | "ppp4" | "none" | "static" | "dslite" | "link";
  IPv6Mode: "dhcp6" | "ppp6" | "none" | "static" | "link";
  PPPoEUserName: string;
  PPPoEPassword: string;
  VLANType: "untagged" | "vlan" | "atm";
  VLANID: string;
  VLANPriority: string;
  StaticIPv4Address?: StaticIPv4Address;
  StaticIPv6Address?: StaticIPv6Address;
}

export interface WanModeConfig {
  WANMode: string;
  Status: string;
  PhysicalType: "Ethernet" | "ADSL" | "VDSL" | "SFP" | "GPON" | "GFAST" | "Bridge" | "WWAN";
  EnableSensing: number;
  DNSMode: "Static" | "Dynamic" | "";
  IPv6DNSMode: "Static" | "Dynamic" | "";
  Interfaces: WanInterface[];
}

export interface WanModeManagementResponse {
  WanModeManagement: WanModeConfig[];
}

export interface WanModeManagementUpdateRequest {
  WanModeManagement: WanModeConfig[];
}
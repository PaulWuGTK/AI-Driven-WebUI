export interface WanIPv6Config {
  IPv6Address: string;
  Prefix: string;
  Gateway: string;
  IPv6Type: string;
  Status: string;
  DNSServer: string;
}

export interface WanIPv4Config  {
  DNSServer: string;
  Gateway: string;
  Status: string;
  SubnetMask: string;
  IPv4Address: string;
  IPv4Mode: string;
}

export interface WanInterface {
  Duplex: string;
  Type: string;
  PPPoEUserName: string;
  VlanPriority: string;
  MACAddress: string;
  ipv6: WanIPv6Config[];
  Name: string;
  ipv4: WanIPv4Config [];
  Speed: string;
  VlanID: string;
  PPPoEPassword: string;
  WanPort: string; // Changed from "Interface" to "WanPort"
}

export interface WanModeConfig {
  Interfaces: WanInterface[];
  DNSMode: string;
  Status: string;
  PhysicalType: string;
  Origin: string;
  EnableSensing: string;
}

export interface StatusWan {
  SensingPolicy: string;
  OperationMode: string;
  WANModeConfig: WanModeConfig;
  WANMode: string;
  SensingTimeout: string;
}

export interface WanStatusResponse {
  StatusWan: StatusWan;
}
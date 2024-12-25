export interface LanIPv6Config {
  IPv6Address: string;
  Name: string;
  Status: string;
}

export interface LanIPv4Config  {
  Status: string;
  IPv4Netmask: string;
  IPv4Address: string;
  Name: string;
}

export interface LanInterface {
  MACAddress: string;
  ipv6: LanIPv6Config[];
  Name: string;
  MTU: string;
  ipv4: LanIPv4Config [];
}

export interface LanStatusResponse {
  StatusLan: LanInterface[];
}
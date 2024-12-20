export interface IPv6Config {
  IPv6Address: string;
  Name: string;
  Status: string;
}

export interface IPv4Config {
  Status: string;
  IPv4Netmask: string;
  IPv4Address: string;
  Name: string;
}

export interface LanInterface {
  MACAddress: string;
  ipv6: IPv6Config[];
  Name: string;
  MTU: string;
  ipv4: IPv4Config[];
}

export interface LanStatusResponse {
  StatusLan: LanInterface[];
}
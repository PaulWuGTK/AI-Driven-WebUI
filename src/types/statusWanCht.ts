export interface StatusWanChtConnection {
  Interface: string;
  Protocol: string;
  IPv4Address?: string;
  IPv4Gateway?: string;
  SubnetMask?: string;
  IPv4PrimaryDNS?: string;
  IPv4SecondaryDNS?: string;
  MACAddress?: string;
  IPv6Address?: string;
  IPv6Gateway?: string;
  IPv6Prefix?: string;
  IPv6PrimaryDNS?: string;
  IPv6SecondaryDNS?: string;
}

export interface StatusWanChtData {
  PPPoE: StatusWanChtConnection;
  IPoE: StatusWanChtConnection;
  Bridge: StatusWanChtConnection;
}

export interface StatusWanChtResponse {
  StatusWanCht: StatusWanChtData;
}

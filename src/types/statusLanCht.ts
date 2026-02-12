export interface StatusLanCht {
  IPv4Protocol: string;
  IPv4Address: string;
  SubnetMask: string;
  IPv4Status: string;
  MACAddress: string;
  IPv6Protocol: string;
  IPv6Address: string;
  IPv6Prefix: string;
  IPv6Status: string;
}

export interface StatusLanChtResponse {
  StatusLanCht: StatusLanCht;
}

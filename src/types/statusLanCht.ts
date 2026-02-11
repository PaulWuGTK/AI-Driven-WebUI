export interface StatusLanCht {
  Protocol: string;
  IPv4Address: string;
  SubnetMask: string;
  MACAddress: string;
  IPv6Address: string;
  IPv6Prefix: string;
}

export interface StatusLanChtResponse {
  StatusLanCht: StatusLanCht;
}

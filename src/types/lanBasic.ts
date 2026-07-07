export interface LANIPSetting {
  IPv4Enable: 0 | 1;
  IPv4Protocol: string;
  IPv4IPAddress: string;
  SubnetMask: string;
  IPv6Enable: 0 | 1;
  IPv6Protocol: string;
  IPv6Address: string;
  IPv6PrefixProtocol: string;
  IPv6Prefix: string;
  ListIPv4Protocol?: string[];
  ListIPv6Protocol?: string[];
  ListIPv6PrefixProtocol?: string[];
}

export interface DHCPv4Setting {
  Enable: 0 | 1;
  DNSServersOrigin: string;
  DNSServers: string;
  BeginAddress: string;
  EndAddress: string;
  SubnetMask: string;
  LeaseTime: number;
  ListDNSServersOrigin?: string[];
}

export interface IPAddressReservation {
  MACAddress: string;
  IPAddress: string;
  Enable: 0 | 1;
}

export interface DeviceConnected {
  Host: string;
  MACAddress: string;
  IPAddress: string;
}

export interface LanBasicResponse {
  LanBasic: {
    LANIPSetting: LANIPSetting;
    DHCPv4Setting: DHCPv4Setting;
    IPAddressReservation: IPAddressReservation[];
  }
}

export interface DeviceConnectedResponse {
  LanDeviceConnected: DeviceConnected[];
}

export interface LanBasicUpdateRequest {
  LanBasic: {
    LANIPSetting: LANIPSetting;
    DHCPv4Setting: DHCPv4Setting;
    IPAddressReservation?: IPAddressReservation[];
  }
}

export interface LANIPSetting {
  Enable: number;
  IPAddress: string;
  SubnetMask: string;
}

export interface DHCPv4Setting {
  Enable: number;
  DNSServers: string;
  BeginAddress: string;
  EndAddress: string;
  SubnetMask: string;
  LeaseTime: string | number;
}

export interface IPAddressReservation {
  MACAddress: string;
  IPAddress: string;
  Enable: number;
}

export interface DeviceConnected {
  Host: string;
  MACAddress: string;
  IPAddress: string;
}

export interface LANBasicResponse {
  LANBasic: {
    LANIPSetting: LANIPSetting;
    DHCPv4Setting: DHCPv4Setting;
    IPAddressReservation: IPAddressReservation[];
    DeviceConnected: DeviceConnected[];
  }
}

export interface LANBasicUpdateRequest {
  LANBasic: {
    LANIPSetting: LANIPSetting;
    DHCPv4Setting: DHCPv4Setting;
    IPAddressReservation: IPAddressReservation[];
  }
}
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
  LeaseTime: number;
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

export interface LanBasicResponse {
  LanBasic: {
    LANIPSetting: LANIPSetting;
    DHCPv4Setting: DHCPv4Setting;
    IPAddressReservation: IPAddressReservation[];
  }
}

export interface DeviceConnectedResponse {
  LanDeviceConnected: {
    DeviceConnected: DeviceConnected[];
  }
}

export interface LanBasicUpdateRequest {
  LanBasic: {
    LANIPSetting: LANIPSetting;
    DHCPv4Setting: DHCPv4Setting;
    IPAddressReservation?: IPAddressReservation[];
  }
}
export interface GuestWiFiInterface {
  InstanceIndex?: number;
  Alias?: string;
  OperatingFrequencyBand?: string;
  Enable: number;
  SSID: string;
  KeyPassPhrase?: string;
  SecurityMode?: string;
  SecurityModeAvailable?: string;
  MFPConfig?: string | number;
  SSIDAdvertisementEnabled?: number;
  IsolationEnable?: number;
  AccessPointReference?: string;
  SSIDReference?: string;
}

export interface GuestWiFiIntfGroup {
  InstanceIndex?: number;
  Alias?: string;
  Enable: number;
  SSID: string;
  KeyPassPhrase: string;
  SecurityMode: string;
  SecurityModeAvailable?: string;
  SSIDAdvertisementEnabled?: number;
  IsolationEnable?: number;
  CommonSSIDEnable: number;
  MLOEnable: number;
  BridgeInterface?: string;
  MFPConfig?: string | number;
  Interface: GuestWiFiInterface[];
}

export interface GuestWiFiResponse {
  GuestWiFi: {
    MeshEnable?: number;
    IntfGroup: GuestWiFiIntfGroup[];
  };
}

export interface GuestWiFiUpdateRequest {
  GuestWiFi: {
    IntfGroup: Array<{
      Alias?: string;
      Enable: number;
      MLOEnable: number;
      SSID: string;
      SecurityMode: string;
      KeyPassPhrase: string;
    }>;
  };
}

export interface GuestLANResponse {
  GuestLAN: {
    GUESTIPSetting: {
      Enable: number;
      IPAddress: string;
      SubnetMask: string;
    };
    DHCPv4Setting: {
      Enable: number;
      DNSServers: string;
      BeginAddress: string;
      EndAddress: string;
      SubnetMask: string;
      LeaseTime: string | number;
    };
  };
}

export interface GuestLANUpdateRequest {
  GuestLAN: {
    GUESTIPSetting: {
      Enable: number;
      IPAddress: string;
      SubnetMask: string;
    };
    DHCPv4Setting: {
      Enable: number;
      DNSServers: string;
      BeginAddress: string;
      EndAddress: string;
      SubnetMask: string;
      LeaseTime: number;
    };
  };
}

export interface GuestDeviceConnected {
  Host: string;
  IPAddress: string;
  MACAddress: string;
}

export interface GuestDeviceConnectedResponse {
  GuestDeviceConnected: GuestDeviceConnected[];
}
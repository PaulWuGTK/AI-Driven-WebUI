export interface GuestWiFiResponse {
  GuestWiFi: {
    Enable: number;
    MLOEnable: number;
    MeshEnable?: number;
    Password: string;
    SecurityMode: string;
    SSID: string;
    SecurityModeAvailable: string;
  };
}

export interface GuestWiFiUpdateRequest {
  GuestWiFi: {
    Enable: number;
    MLOEnable: number;
    Password: string;
    SecurityMode: string;
    SSID: string;
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
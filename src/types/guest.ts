export interface GuestWiFiResponse {
  GuestWiFi: {
    Enable: number;
    Password: string;
    SecurityMode: string;
    SSID: string;
    SecurityModeAvailable: string;
  };
}

export interface GuestWiFiUpdateRequest {
  GuestWiFi: {
    Enable: number;
    Password: string;
    SecurityMode: string;
    SSID: string;
  };
}

export interface GuestLANResponse {
  GuestLAN: {
    LANIPSetting: {
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
    LANIPSetting: {
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
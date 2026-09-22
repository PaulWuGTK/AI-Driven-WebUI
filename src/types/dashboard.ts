export interface DashboardMemory {
  Total: number;
  Free: number;
}

export interface DashboardEthernetPort {
  Duplex: string;
  Port: string;
  Speed: string;
  Role: string;
  Status: string;
}

export interface DashboardWiFiBand {
  Alias?: string;
  InstanceIndex?: number;
  OperatingFrequencyBand?: string;
  KeyPassPhrase: string;
  Enable: number;
  SecurityModeAvailable: string;
  SSID: string;
  SecurityMode: string;
}

export interface DashboardGuestWiFiBand {
  Alias?: string;
  InstanceIndex?: number;
  OperatingFrequencyBand?: string;
  Enable: number;
  GuestClients: number;
  SSID: string;
  KeyPassPhrase: string;
}

export interface DashboardWAN {
  Protocol: string;
  InternetAddress: string;
  SubnetMask: string;
  DefaultGateway: string;
  PrimaryDNS: string;
  SecondaryDNS: string;
  MacAddress: string;
}

export interface DashboardCPU {
  CPUUsage: number;
}

export interface DashboardSystem {
  SoftwareVersion: string;
  HardwareVersion: string;
  SerialNumber: string;
  ModelName: string;
}

export interface DashboardResponse {
  Dashboard: {
    Memory: DashboardMemory;
    Ethernet: DashboardEthernetPort[];
    WiFi: DashboardWiFiBand[];
    Guest?: DashboardGuestWiFiBand[];
    WAN: DashboardWAN;
    CPU: DashboardCPU;
    System: DashboardSystem;
  }
}
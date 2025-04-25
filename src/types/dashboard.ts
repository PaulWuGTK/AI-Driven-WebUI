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
  Password: string;
  Enable: number;
  SecurityModeAvailable: string;
  SSID: string;
  SecurityMode: string;
}

export interface DashboardWiFi {
  "wifi2g": DashboardWiFiBand;
  "wifi5g": DashboardWiFiBand;
  "wifi6g": DashboardWiFiBand;
}

export interface DashboardGuestWiFiBand {
  Enable: number;
  GuestClients: number;
  SSID: string;
  Password: string;
}

export interface DashboardGuest {
  "wifi2g": DashboardGuestWiFiBand;
  "wifi5g": DashboardGuestWiFiBand;
  "wifi6g": DashboardGuestWiFiBand;
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
    WiFi: DashboardWiFi;
    Guest?: DashboardGuest;
    WAN: DashboardWAN;
    CPU: DashboardCPU;
    System: DashboardSystem;
  }
}
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
  BytesSent: number;
  PacketsSent: number;
  BytesReceived: number;
  PacketsReceived: number;
}

export interface DashboardWiFi {
  "2_4GHz": DashboardWiFiBand;
  "5GHz": DashboardWiFiBand;
  "6GHz": DashboardWiFiBand;
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
    WAN: DashboardWAN;
    CPU: DashboardCPU;
    System: DashboardSystem;
  }
}
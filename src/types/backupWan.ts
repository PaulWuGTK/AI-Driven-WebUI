export interface WANHealthCheck {
  CheckMethod: 'Ping' | 'DNS';
  Alias: string;
  CheckPeriod: number;
  Name?: string;
  DNSAddress: string;
  Status?: string;
  PingAddress: string;
  CheckCount: number;
}

export interface BackupWANConfig {
  NOK?:string;
  PhysicalInterface: string;
  SupportedEthernetInterface: string[];
  SupportedCellularInterface: string[];
  Enable: 0 | 1;
  WHCEnable: 0 | 1;
  PhysicalType: 'Ethernet' | 'Cellular';
  WANHealthCheck: WANHealthCheck[];
}

export interface BackupWANResponse {
  BackupWAN: BackupWANConfig;
  NOK?:string;
}

export interface BackupWANRequest {
  BackupWAN: {
    Enable: 0 | 1;
    PhysicalType: string;
    PhysicalInterface: string;
    WHCEnable: 0 | 1;
    WANHealthCheck: Array<{
      Alias: string;
      CheckMethod: string;
      CheckCount: number;
      CheckPeriod: number;
      PingAddress: string;
      DNSAddress: string;
    }>;
  };
}

export interface WANHealthCheck {
  CheckMethod: 'Ping' | 'DNS';
  Alias?: string;
  CheckPeriod: number;
  Name: string;
  DNSAddress: string;
  Status?: string;
  PingAddress: string;
  CheckCount: number;
}

export interface BackupWANConfig {
  PhysicalInterface: string;
  SupportedPhysicalInterface: string[];
  Enable: number | boolean;
  WHCEnable: number | boolean;
  PhysicalType: 'Ethernet' | 'Cellular';
  WANHealthCheck: WANHealthCheck[];
}

export interface BackupWANResponse {
  BackupWAN: BackupWANConfig;
}

export interface BackupWANRequest {
  BackupWAN: {
    Enable: boolean;
    PhysicalType: string;
    PhysicalReference: string;
    WHCEnable: boolean;
    WANHealthCheck: Array<{
      CheckMethod: string;
      CheckCount: number;
      CheckPeriod: number;
      PingAddress: string;
      DNSAddress: string;
      Name: string;
    }>;
  };
}

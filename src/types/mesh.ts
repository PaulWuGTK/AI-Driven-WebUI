export interface MeshNode {
  Name: string;
  Mode: 'Controller' | 'Agent' | 'Client';
  ipv4: string;
  MACAddress: string;
  MediaType: string;
  Upstream: string;
  UpstreamBand?: string;
  SupportedBand?: string;
  TxRate?: string;
  RxRate?: string;
  RSSI?: number | string;
}

export interface MeshMapResponse {
  MeshMap: MeshNode[];
}

export interface SteeringControlData {
  stationMac: string;
  targetBssid: string;
  band: string;
}

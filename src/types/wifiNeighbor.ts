export interface WifiNeighborInfo {
  WirelessMode: string;
  Channel: number;
  BSSID: string;
  Security: string;
  SSID: string;
  Signal: number;
}

export interface WifiNeighborResponse {
  Enable2g?: number;
  Enable5g?: number;
  Enable6g?: number;
  WifiNeighbor?: WifiNeighborInfo[];
}

export interface WifiNeighborScanRequest {
  WifiNeighbor: {
    Band: string;
  }
}
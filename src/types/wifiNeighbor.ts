export interface WifiNeighborInfo {
  WirelessMode: string;
  Channel: number;
  BSSID: string;
  Security: string;
  SSID: string;
  Signal: number;
}

export interface WifiNeighborScanResponse {
  WifiNeighbor: WifiNeighborInfo[];
}

export interface WifiNeighborStatusResponse {
  WifiNeighbor: {
    Enable2g: number;
    Enable5g: number;
    Enable6g: number;
  };
}

export interface WifiNeighborScanRequest {
  WifiNeighbor: {
    Band: string;
  }
}
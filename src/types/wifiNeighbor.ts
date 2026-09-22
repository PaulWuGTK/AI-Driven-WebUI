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

export interface WifiNeighborInterface {
  InstanceIndex?: number;
  Alias: string;
  OperatingFrequencyBand: string;
  Enable: number;
}

export interface WifiNeighborStatusResponse {
  WifiNeighbor: {
    Interfaces: WifiNeighborInterface[];
  };
}

export interface WifiNeighborScanRequest {
  WifiNeighbor: {
    Alias: string;
  }
}
export interface MACFilteringEntry {
  Alias?: string;
  InstanceIndex?: number;
  OperatingFrequencyBand?: string;
  Path: string;
  SSID: string;
  ACLMode: string;
  MACList: string;
}

export interface MACFilteringResponse {
  WifiMACFiltering: {
    Interfaces: MACFilteringEntry[];
  };
}

export interface MACFilteringUpdateRequest {
  WifiMACFiltering: {
    Interfaces: Array<{
      Alias?: string;
      ACLMode: string;
      MACList: string;
    }>;
  };
}

export interface MACAddress {
  address: string;
}
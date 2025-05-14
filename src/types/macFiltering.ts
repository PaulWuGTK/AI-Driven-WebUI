export interface MACFilteringEntry {
  Path: string;
  SSID: string;
  ACLMode: string;
  MACList: string;
}

export interface MACFilteringResponse {
  MACFiltering: {
    wifi2g: MACFilteringEntry[];
    wifi5g: MACFilteringEntry[];
    wifi6g: MACFilteringEntry[];
  };
}

export interface MACFilteringUpdateRequest {
  MACFiltering: {
    wifi2g: MACFilteringEntry[];
    wifi5g: MACFilteringEntry[];
    wifi6g: MACFilteringEntry[];
  };
}

export interface MACAddress {
  address: string;
}
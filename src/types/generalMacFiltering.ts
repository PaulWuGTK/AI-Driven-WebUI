export interface GeneralMacFilteringEntry {
  No: number;
  MACAddress: string;
  Comment: string;
}

export interface GeneralMacFilteringConfig {
  Enable: boolean;
  WhiteList: GeneralMacFilteringEntry[];
  BlackList: GeneralMacFilteringEntry[];
}

export interface GeneralMacFilteringResponse {
  MACFiltering: GeneralMacFilteringConfig;
}

export interface GeneralMacFilteringUpdateRequest {
  MACFiltering: GeneralMacFilteringConfig;
}

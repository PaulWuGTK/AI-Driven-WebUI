export interface TimezoneEntry {
  DstSupport: number;
  tzNDST: string;
  tzDST: string;
  region: string;
}

export interface TimezoneResponse {
  Timezone: TimezoneEntry[];
}

export interface TimezoneUpdateRequest {
  Timezone: {
    TimeZone: string;
  }
}
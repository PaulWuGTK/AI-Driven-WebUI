export interface TimezoneResponse {
  Timezone: {
    TimeZones: string[];
  }
}

export interface TimezoneUpdateRequest {
  Timezone: {
    TimeZone: string;
  }
}
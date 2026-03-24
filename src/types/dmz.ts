export interface DmzResponse {
  AdvancedDmz: {
    Enable: 0 | 1;
    IPAddress: string;
  }
}

export interface DmzUpdateRequest {
  AdvancedDmz: {
    Enable: 0 | 1;
    IPAddress: string;
  }
}

export interface DmzResponse {
  AdvancedDmz: {
    Enable: boolean;
    IPAddress: string;
  }
}

export interface DmzUpdateRequest {
  AdvancedDmz: {
    Enable: boolean;
    IPAddress: string;
  }
}
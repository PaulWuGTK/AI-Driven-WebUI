export interface NtpResponse {
  Ntp: {
    CurrentLocalTime: string;
    TimeZones: string;
    DstEnable: number;
    NtpEnable: number;
    NtpServers: string[];
  }
}

export interface NtpUpdateRequest {
  Ntp: {
    SetTZ: string;
    NtpServers: string;
    NtpEnable: number;
    REGION: number;
  }
}
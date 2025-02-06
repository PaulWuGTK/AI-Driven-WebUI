import type { WanStatusResponse, LanStatusResponse, WlanStatusResponse, StatisticsResponse, NtpResponse, NtpUpdateRequest } from '../types';
import type { TimezoneResponse, TimezoneUpdateRequest } from '../types/timezone';
import type { DdnsResponse, DdnsUpdateRequest } from '../types/ddns';
import type { SshServer, SshServerResponse, SshAuthorizedKey, SshAuthorizedKeyResponse, SshSession, SshSessionResponse } from '../types/ssh';
import type { WifiNeighborScanResponse, WifiNeighborStatusResponse, WifiNeighborScanRequest } from '../types/wifiNeighbor';
import type { StatusLcmResponse } from '../types/lcm';
import { wanMockData } from './mockData/wanMockData';
import { lanMockData } from './mockData/lanMockData';
import { wlanMockData } from './mockData/wlanMockData';
import { statisticsMockData } from './mockData/statisticsMockData';
import { ntpMockData } from './mockData/ntpMockData';
import { timezoneData } from './mockData/timezoneData';
import { ddnsData } from './mockData/ddnsData';
import { sshServerData,sshAuthorizedKeyData, sshSessionData } from './mockData/sshData';
import { handleApiResponse } from '../utils/apiUtils';
import { callApi } from './apiClient';

const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = '/API';

export async function getWanStatus(): Promise<WanStatusResponse> {
  if (isDevelopment) {
    return wanMockData;
  }
  const response = await fetch(`${API_BASE_URL}/info?list=StatusWan`);
  return handleApiResponse<WanStatusResponse>(response);
}

export async function getLanStatus(): Promise<LanStatusResponse> {
  if (isDevelopment) {
    return lanMockData;
  }
  const response = await fetch(`${API_BASE_URL}/info?list=StatusLan`);
  return handleApiResponse<LanStatusResponse>(response);
}

export async function getWlanStatus(): Promise<WlanStatusResponse> {
  if (isDevelopment) {
    return wlanMockData;
  }
  const response = await fetch(`${API_BASE_URL}/info?list=StatusWlan`);
  return handleApiResponse<WlanStatusResponse>(response);
}

export async function getStatistics(): Promise<StatisticsResponse> {
  if (isDevelopment) {
    return statisticsMockData;
  }
  const response = await fetch(`${API_BASE_URL}/info?list=Statistics`);
  return handleApiResponse<StatisticsResponse>(response);
}

export async function getWifiNeighbors(): Promise<WifiNeighborStatusResponse> {
  if (isDevelopment) {
    return {
      "WifiNeighbor": {
          Enable2g: 1,
          Enable5g: 1,
          Enable6g: 0,
      }
    };
  }
  const response = await fetch(`${API_BASE_URL}/info?list=WifiNeighbor`);
  return handleApiResponse<WifiNeighborStatusResponse>(response);
}

export async function scanWifiNeighbors(band: string): Promise<WifiNeighborScanResponse> {
  if (isDevelopment) {
    return {
      WifiNeighbor: [
        {
          WirelessMode: "g,n,ac,ax",
          Channel: 1,
          BSSID: "80:02:9C:E8:CA:CB",
          Security: "WPA2-Personal",
          SSID: "GO_AP",
          Signal: -42
        },
        {
          WirelessMode: "g,n",
          Channel: 1,
          BSSID: "EC:08:6B:ED:26:A2",
          Security: "WPA2-Personal",
          SSID: "GJ1750_2G",
          Signal: -56
        }
      ]
    };
  }
  
  const response = await fetch(`${API_BASE_URL}/info?list=WifiNeighbor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      WifiNeighbor: { Band: band }
    } as WifiNeighborScanRequest),
  });
  return handleApiResponse<WifiNeighborScanResponse>(response);
}

export async function getLcmStatus(): Promise<StatusLcmResponse> {
  if (isDevelopment) {
    return {
      StatusLcm: {
        ExecutionUnitNumberOfEntries: 1,
          ExecEnvNumberOfEntries: 1,
        DeploymentUnitNumberOfEntries: 1,
        DeploymentUnits: [
      {
            Alias: "cpe-a47d1132-f667-5029-b94b-ca498da79729",
            Resolved: 1,
            Name: "arm32v7/lcm-webui-generic",
            URL: "docker://10.5.163.2:5000/arm32v7/lcm-webui-generic:1.0.3",
            Status: "Installed",
            Version: "1.0.3",
            Vendor: "Gemtek",
            UUID: "99bdc305-b8ff-59cd-8b2d-b1010d2d69a5"
          }
        ]
      }
    };
  }
  const response = await fetch(`${API_BASE_URL}/info?list=StatusLcm`);
  return handleApiResponse<StatusLcmResponse>(response);
}

export async function getNtpSettings(): Promise<NtpResponse> {
  if (isDevelopment) {
    return ntpMockData;
  }
  const response = await fetch(`${API_BASE_URL}/info?list=Ntp`);
  return handleApiResponse<NtpResponse>(response);
}

export async function updateNtpSettings(data: NtpUpdateRequest): Promise<NtpResponse> {
  if (isDevelopment) {
    return {
      Ntp: {
        ...ntpMockData.Ntp,
        NtpServers: data.Ntp.NtpServers.split(',').map(s => s.trim()),
        NtpEnable: data.Ntp.NtpEnable,
        TimeZones: String(data.Ntp.REGION),
      }
    };
  }
  
  const response = await fetch(`${API_BASE_URL}/info?list=Ntp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse<NtpResponse>(response);
}
export async function getTimezones(): Promise<TimezoneResponse> {
  if (isDevelopment) {
    return timezoneData;
  }
  const response = await fetch('/API/info?list=Timezone');
  return handleApiResponse<TimezoneResponse>(response);
}

export async function updateTimezone(data: TimezoneUpdateRequest): Promise<TimezoneResponse> {
  if (isDevelopment) {
    return timezoneData;
  }
  const response = await fetch('/API/info?list=Timezone', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse<TimezoneResponse>(response);
}

export async function getDdns(): Promise<DdnsResponse> {
  if (isDevelopment) {
    return ddnsData;
  }
  const response = await fetch('/API/info?list=Ddns');
  return handleApiResponse<DdnsResponse>(response);
}

export async function updateDdns(data: DdnsUpdateRequest): Promise<DdnsResponse> {
  if (isDevelopment) {
    return ddnsData;
  }
  const response = await fetch('/API/info?list=Ddns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse<DdnsResponse>(response);
}

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
  return callApi<WanStatusResponse>(`${API_BASE_URL}/info?list=StatusWan`);
}

export async function getLanStatus(): Promise<LanStatusResponse> {
  if (isDevelopment) {
    return lanMockData;
  }
  return callApi<LanStatusResponse>(`${API_BASE_URL}/info?list=StatusLan`);
}

export async function getWlanStatus(): Promise<WlanStatusResponse> {
  if (isDevelopment) {
    return wlanMockData;
  }
  return callApi<WlanStatusResponse>(`${API_BASE_URL}/info?list=StatusWlan`);
}

export async function getStatistics(): Promise<StatisticsResponse> {
  if (isDevelopment) {
    return statisticsMockData;
  }
  return callApi<StatisticsResponse>(`${API_BASE_URL}/info?list=Statistics`);
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
  return callApi<WifiNeighborStatusResponse>(`${API_BASE_URL}/info?list=WifiNeighbor`);
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

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0; // 生成 0~15 的隨機數
    const v = c === 'x' ? r : (r & 0x3) | 0x8; // 確保 UUID 格式正確
    return v.toString(16);
  });
};

const generateRandomDeploymentUnits = (count: number) => {
  const statuses = ["Installed", "Pending", "Failed"];
  const versions = ["1.0.1", "1.0.2", "1.0.3", "2.0.0"];
  const vendors = ["Gemtek", "Qualcomm", "Broadcom"];
  
  return Array.from({ length: count }, () => ({
    Alias: `cpe-${generateUUID().slice(0, 8)}`,  // 生成一個部分 UUID 作為 Alias
    Resolved: Math.random() > 0.5 ? 1 : 0, // 隨機 0 或 1
    Name: "arm32v7/lcm-webui-generic",
    URL: `docker://10.5.163.2:5000/arm32v7/lcm-webui-generic:${versions[Math.floor(Math.random() * versions.length)]}`,
    Status: statuses[Math.floor(Math.random() * statuses.length)],
    Version: versions[Math.floor(Math.random() * versions.length)],
    Vendor: vendors[Math.floor(Math.random() * vendors.length)],
    UUID: generateUUID()  // 生成完整的 UUID
  }));
};

export async function getLcmStatus(): Promise<StatusLcmResponse> {
  if (isDevelopment) {
    const count = Math.floor(Math.random() * 15) + 1
    return {
      StatusLcm: {
        ExecutionUnitNumberOfEntries: 1,
        ExecEnvNumberOfEntries: 1,
        DeploymentUnitNumberOfEntries: count,
        DeploymentUnits: generateRandomDeploymentUnits(count)
      }
    };
  }
  return callApi<StatusLcmResponse>(`${API_BASE_URL}/info?list=StatusLcm`);
}

export async function getNtpSettings(): Promise<NtpResponse> {
  if (isDevelopment) {
    return ntpMockData;
  }
  return callApi<NtpResponse>(`${API_BASE_URL}/info?list=Ntp`);
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
  return callApi<TimezoneResponse>(`${API_BASE_URL}/info?list=Timezone`);
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
  return callApi<DdnsResponse>(`${API_BASE_URL}/info?list=Ddns`);
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

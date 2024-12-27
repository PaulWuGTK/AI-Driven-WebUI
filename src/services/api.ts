import type { WanStatusResponse, LanStatusResponse, WlanStatusResponse, StatisticsResponse, NtpResponse, NtpUpdateRequest } from '../types';
import type { TimezoneResponse, TimezoneUpdateRequest } from '../types/timezone';
import type { DdnsResponse, DdnsUpdateRequest } from '../types/ddns';
import type { SshResponse, SshUpdateRequest } from '../types/ssh';
import { wanMockData } from './mockData/wanMockData';
import { lanMockData } from './mockData/lanMockData';
import { wlanMockData } from './mockData/wlanMockData';
import { statisticsMockData } from './mockData/statisticsMockData';
import { ntpMockData } from './mockData/ntpMockData';
import { timezoneData } from './mockData/timezoneData';
import { ddnsData } from './mockData/ddnsData';
import { sshData } from './mockData/sshData';
import { handleApiResponse } from '../utils/apiUtils';


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

export async function getSsh(): Promise<SshResponse> {
  if (isDevelopment) {
    return sshData;
  }
  const response = await fetch('/API/info?list=Ssh');
  return handleApiResponse<SshResponse>(response);
}

export async function updateSsh(data: SshUpdateRequest): Promise<SshResponse> {
  if (isDevelopment) {
    return sshData;
  }
  const response = await fetch('/API/info?list=Ssh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse<SshResponse>(response);
}
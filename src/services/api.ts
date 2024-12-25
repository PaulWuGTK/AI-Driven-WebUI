import type { WanStatusResponse, LanStatusResponse, WlanStatusResponse, StatisticsResponse, NtpResponse, NtpUpdateRequest } from '../types';
import { wanMockData } from './mockData/wanMockData';
import { lanMockData } from './mockData/lanMockData';
import { wlanMockData } from './mockData/wlanMockData';
import { statisticsMockData } from './mockData/statisticsMockData';
import { ntpMockData } from './mockData/ntpMockData';
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
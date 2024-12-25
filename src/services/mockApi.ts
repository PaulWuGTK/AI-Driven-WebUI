import type { WanStatusResponse } from '../types/wan';
import type { LanStatusResponse } from '../types/lan';
import type { WlanStatusResponse } from '../types/wlan';
import type { StatisticsResponse } from '../types/statistics';
import type { NtpResponse, NtpUpdateRequest } from '../types/ntp';

import { wanMockData } from './mockData/wanMockData';
import { lanMockData } from './mockData/lanMockData';
import { wlanMockData } from './mockData/wlanMockData';
import { statisticsMockData } from './mockData/statisticsMockData';
import { ntpMockData } from './mockData/ntpMockData';

export const getMockWanStatus = (): WanStatusResponse => wanMockData;
export const getMockLanStatus = (): LanStatusResponse => lanMockData;
export const getMockWlanStatus = (): WlanStatusResponse => wlanMockData;
export const getMockStatistics = (): StatisticsResponse => statisticsMockData;
export const getMockNtp = (): NtpResponse => ntpMockData;

export const updateMockNtp = (data: NtpUpdateRequest): NtpResponse => {
  const servers = data.Ntp.NtpServers.split(',').map(s => s.trim());
  while (servers.length < 5) servers.push('');
  
  return {
    Ntp: {
      NtpServers: servers,
      NtpEnable: data.Ntp.NtpEnable,
      TimeZones: String(data.Ntp.REGION),
      DstEnable: 0,
      CurrentLocalTime: new Date().toISOString()
    }
  };
};
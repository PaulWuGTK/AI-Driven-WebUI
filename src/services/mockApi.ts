import type { WanStatusResponse } from '../types/wan';
import type { LanStatusResponse } from '../types/lan';
import type { WlanStatusResponse } from '../types/wlan';
import type { StatisticsResponse } from '../types/statistics';
import type { NtpResponse, NtpUpdateRequest } from '../types/ntp';
import type { LogResponse } from '../types/log';
import type { QosBandwidthResponse, QosRuleResponse } from '../types/qos';
import type { BackupWANResponse, BackupWANRequest } from '../types/backupWan';

import { wanMockData } from './mockData/wanMockData';
import { lanMockData } from './mockData/lanMockData';
import { wlanMockData } from './mockData/wlanMockData';
import { statisticsMockData } from './mockData/statisticsMockData';
import { ntpMockData } from './mockData/ntpMockData';
import { getMeshMockData } from './mockData/dashboard/meshMock';
import { generateMockLogs } from './mockData/logMockData';
import { qosBandwidthMockData, qosRuleMockData } from './mockData/qosMockData';
import { mockBackupWANData } from './mockData/backupWanMockData';

export const getMockWanStatus = (): WanStatusResponse => wanMockData;
export const getMockLanStatus = (): LanStatusResponse => lanMockData;
export const getMockWlanStatus = (): WlanStatusResponse => wlanMockData;
export const getMockStatistics = (): StatisticsResponse => statisticsMockData;
export const getMockNtp = (): NtpResponse => ntpMockData;
export const getMockMeshMap = () => ({ MeshMap: getMeshMockData() });
export const getMockLogs = (request?: any): LogResponse => generateMockLogs(request?.StatusLog);
export const getMockQosBandwidth = (): QosBandwidthResponse => qosBandwidthMockData;
export const getMockQosRule = (): QosRuleResponse => qosRuleMockData;
export const getMockBackupWAN = (): BackupWANResponse => mockBackupWANData;

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

export const updateMockBackupWAN = (data: BackupWANRequest): BackupWANResponse => {
  return {
    BackupWAN: {
      ...mockBackupWANData.BackupWAN,
      Enable: data.BackupWAN.Enable ? 1 : 0,
      WHCEnable: data.BackupWAN.WHCEnable ? 1 : 0,
      PhysicalType: data.BackupWAN.PhysicalType as 'Ethernet' | 'Cellular',
      WANHealthCheck: data.BackupWAN.WANHealthCheck.map(hc => ({
        ...hc,
        CheckMethod: hc.CheckMethod as 'Ping' | 'DNS',
        Status: 'Disabled'
      }))
    }
  };
};
import { callApi } from '../apiClient';
import {
  getSystemMockData,
  getCpuMockData,
  getMemoryMockData,
  getWanMockData,
  getWifiMockData,
  getEthernetMockData
} from '../mockData/dashboard';

const isDevelopment = import.meta.env.DEV;

interface WanParameters {
  WANMode?: string;
  Alias?: string;
  IPv4Reference?: string;
}

interface WanResponse {
  path: string;
  parameters: WanParameters;
}

interface WanStats {
  parameters: {
    PacketsSent: number;
    PacketsReceived: number;
    BytesSent: number;
    BytesReceived: number;
  };
  path: string;
}

export const getSystemInfo = async () => {
  if (isDevelopment) {
    return getSystemMockData();
  }
  return callApi('/serviceElements/Device.DeviceInfo.');
};

export const getCpuInfo = async () => {
  if (isDevelopment) {
    return getCpuMockData();
  }
  return callApi('/serviceElements/Device.DeviceInfo.');
};

export const getMemoryInfo = async () => {
  if (isDevelopment) {
    return getMemoryMockData();
  }
  return callApi('/serviceElements/Device.DeviceInfo.');
};

export const getWanList = async () => {
  return callApi<WanResponse[]>('/serviceElements/Device.X_PRPL-COM_WANManager.');
};

export const getWanDetails = async (path: string) => {
  return callApi<WanResponse[]>(`/serviceElements/${path}`);
};

export const getWanStats = async (statsPath: string) => {
  return callApi<WanStats[]>(`/serviceElements/${statsPath}`);
};

export const getWanInfo = async () => {
  if (isDevelopment) {
    return getWanMockData();
  } else {
    try {
      const wanList = await getWanList();

      const wanManager = wanList.find(
        (item) => item.path === 'Device.X_PRPL-COM_WANManager.'
      );
      const wanMode = wanManager?.parameters?.WANMode || 'default';

      const targetWan = wanList.find(
        (wan) =>
          wan.parameters.Alias === wanMode && wan.path.includes('WAN.')
      );

      if (!targetWan) {
        throw new Error(`No matching WAN interface found for mode: ${wanMode}`);
      }

      const wanDetails = await getWanDetails(targetWan.path);
      const intf = wanDetails.find((i) => i.path.includes('Intf.1.'));

      if (!intf || !intf.parameters?.IPv4Reference) {
        throw new Error('No matching WAN interface or IPv4Reference found.');
      }

      const stats = await getWanStats(`${intf.parameters.IPv4Reference}Stats.`);
      let wanStats = null;

      if (Array.isArray(stats)) {
        wanStats = stats.find(
          (item) => item.path === 'Device.IP.Interface.2.Stats.'
        );
      } else {
        console.error('stats is not an array:', stats);
      }

      return {
        PacketsSent: wanStats?.parameters.PacketsSent || 0,
        PacketsReceived: wanStats?.parameters.PacketsReceived || 0,
        BytesSent: wanStats?.parameters.BytesSent || 0,
        BytesReceived: wanStats?.parameters.BytesReceived || 0
      };
      
    } catch (error) {
      console.error('Error fetching WAN data:', error);

      return {
        PacketsSent: 0,
        PacketsReceived: 0,
        BytesSent: 0,
        BytesReceived: 0
      };
    }
  }
};

export const getWifiInfo = async () => {
  if (isDevelopment) {
    return getWifiMockData();
  }
  return callApi('/serviceElements/Device.WiFi.');
};

export const getEthernetInfo = async () => {
  if (isDevelopment) {
    return getEthernetMockData();
  }
  return callApi('/API/info?list=EthernetStatus');
};
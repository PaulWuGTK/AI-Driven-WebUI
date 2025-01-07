import {
  getSystemMockData,
  getCpuMockData,
  getMemoryMockData,
  getWanMockData,
  getWifiMockData,
  getEthernetMockData
} from '../mockData/dashboard';

const isDevelopment = import.meta.env.DEV;

export const getSystemInfo = async () => {
  if (isDevelopment) {
    return getSystemMockData();
  }
  const response = await fetch('/serviceElements/Device.DeviceInfo.');
  return response.json();
};

export const getCpuInfo = async () => {
  if (isDevelopment) {
    return getCpuMockData();
  }
  const response = await fetch('/serviceElements/Device.DeviceInfo.');
  return response.json();
};

export const getMemoryInfo = async () => {
  if (isDevelopment) {
    return getMemoryMockData();
  }
  const response = await fetch('/serviceElements/Device.DeviceInfo.');
  return response.json();
};


export const getWanList = async () => {
  const response = await fetch('/serviceElements/Device.X_PRPL-COM_WANManager.');
  return response.json();
};

export const getWanDetails = async (path: string) => {
  const response = await fetch(`/serviceElements/${path}`);
  return response.json();
};

export const getWanStats = async (statsPath: string) => {
  const response = await fetch(`/serviceElements/${statsPath}`);
  return response.json();
};

export const getWanInfo = async () => {
  if (isDevelopment) {
    return getWanMockData();
  } else {
    try {
      const wanList = await getWanList();

      const wanManager = wanList.find(
        (item: any) => item.path === 'Device.X_PRPL-COM_WANManager.'
      );
      const wanMode = wanManager?.parameters?.WANMode || 'default';

      const targetWan = wanList.find(
        (wan: any) =>
          wan.parameters.Alias === wanMode && wan.path.includes('WAN.')
      );

      if (!targetWan) {
        throw new Error(`No matching WAN interface found for mode: ${wanMode}`);
      }

      const wanDetails = await getWanDetails(targetWan.path);
      const intf = wanDetails.find((i: any) => i.path.includes('Intf.1.'));

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
        PacketsSent: wanStats.parameters.PacketsSent || 0,
        PacketsReceived: wanStats.parameters.PacketsReceived || 0,
        BytesSent: wanStats.parameters.BytesSent || 0,
        BytesReceived: wanStats.parameters.BytesReceived || 0
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
  const response = await fetch('/serviceElements/Device.WiFi.');
  return response.json();
};

export const getEthernetInfo = async () => {
  if (isDevelopment) {
    return getEthernetMockData();
  }
  const response = await fetch('/API/info?list=EthernetStatus');
  return response.json();
};
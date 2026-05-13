import { callApi } from '../apiClient';
import type { DashboardResponse } from '../../types/dashboard';
import { isOpenWrtWifiLogoMode } from '../../config/runtimeMode';
import { getOpenWrtHomeSummary } from '../api-openwrt/home';

const isDevelopment = import.meta.env.DEV;

// Store previous values for realistic fluctuations
let previousValues = {
  memory: {
    free: 340448
  },
  cpu: {
    usage: 45
  }
};

// Helper function to generate random fluctuation
const getFluctuation = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// Helper function to ensure value stays within bounds
const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};
const normalizeBoardName = (value?: string): string => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  const boardPart = trimmed.includes(',') ? trimmed.split(',').slice(-1)[0] : trimmed;
  return boardPart.replace(/[_-]+/g, ' ').toUpperCase();
};

// Generate mock data with realistic variations
const generateMockData = (): DashboardResponse => {
  // Update memory free space (fluctuate between 30-50% of total)
  const totalMemory = 897980;
  const minFree = totalMemory * 0.3;
  const maxFree = totalMemory * 0.5;
  const memoryFluctuation = getFluctuation(-10000, 10000);
  previousValues.memory.free = clamp(
    previousValues.memory.free + memoryFluctuation,
    minFree,
    maxFree
  );

  // Update CPU usage (gradual changes, avoid sudden spikes)
  const cpuFluctuation = getFluctuation(-5, 5);
  previousValues.cpu.usage = clamp(
    previousValues.cpu.usage + cpuFluctuation,
    10,
    90
  );

  return {
    Dashboard: {
      Memory: {
        Total: totalMemory,
        Free: Math.floor(previousValues.memory.free)
      },
      Ethernet: [
        {
          Port: "Port1",
          Role: "wan",
          Status: Math.random() > 0.5 ? "Up" : "Down",
          Speed: "1000",
          Duplex: "Full"
        },
        {
          Port: "Port0",
          Role: "lan",
          Status: "Up",
          Speed: "1000",
          Duplex: "Full"
        },
        {
          Port: "Port3",
          Role: "lan",
          Status: "Up",
          Speed: "1000",
          Duplex: "Full"
        },
        {
          Port: "Port2",
          Role: "lan",
          Status: "Up",
          Speed: "1000",
          Duplex: "Full"
        },
        {
          Port: "Port4",
          Role: "lan",
          Status: Math.random() > 0.5 ? "Up" : "Down",
          Speed: "1000",
          Duplex: "Full"
        }
      ],
      WiFi: {
        "wifi2g": {
          Password: "GemtekVIP",
          Enable: 1,
          SecurityModeAvailable: "None,WPA2-Personal,WPA3-Personal,WPA2-WPA3-Personal",
          SSID: "Gemtek_prplmesh",
          SecurityMode: "WPA2-Personal"
        },
        "wifi5g": {
          Password: "GemtekVIP",
          Enable: 1,
          SecurityModeAvailable: "None,WPA2-Personal,WPA3-Personal,WPA2-WPA3-Personal",
          SSID: "Gemtek_prplmesh_5GHz",
          SecurityMode: "None"
        },
        "wifi6g": {
          Password: "GemtekVIP",
          Enable: 1,
          SecurityModeAvailable: "WPA3-Personal",
          SSID: "Gemtek_prplmesh_6GHz",
          SecurityMode: "WPA3-Personal"
        }
      },
      Guest: {
        "wifi2g": {
          Enable: 0,
          GuestClients: 0,
          SSID: "prplOS-guest",
          Password: "GemtekGuest"
        },
        "wifi5g": {
          Enable: 0,
          GuestClients: 0,
          SSID: "prplOS-guest",
          Password: "GemtekGuest"
        },
        "wifi6g": {
          Enable: 0,
          GuestClients: 0,
          SSID: "prplOS-guest",
          Password: "GemtekGuest"
        }
      },
      WAN: {
        Protocol: "DHCP",
        InternetAddress: "192.168.99.51",
        SubnetMask: "255.255.255.0",
        DefaultGateway: "192.168.99.1",
        PrimaryDNS: "8.8.8.8",
        SecondaryDNS: "8.8.4.4",
        MacAddress: "4c:ba:7d:a7:55:22"
      },
      CPU: {
        CPUUsage: Math.floor(previousValues.cpu.usage)
      },
      System: {
        SoftwareVersion: "1.0.2",
        HardwareVersion: "V03",
        SerialNumber: "SNAA0BA885FACD",
        ModelName: "TB-372-PRPL"
      }
    }
  };
};

const applyOpenWrtSummaryToDashboard = async (dashboard: DashboardResponse): Promise<DashboardResponse> => {
  const result = { ...dashboard };
  try {
    const summaryResponse = await getOpenWrtHomeSummary();
    const summary = summaryResponse.HomeSummary;

    result.Dashboard.System.SoftwareVersion =
      summary.FirmwareVersion || result.Dashboard.System.SoftwareVersion;
    result.Dashboard.System.HardwareVersion =
      normalizeBoardName(summary.BoardName) || summary.FirmwareRevision || result.Dashboard.System.HardwareVersion;
    result.Dashboard.System.ModelName =
      summary.ModelName || result.Dashboard.System.ModelName;

    const bandMap: Record<string, 'wifi2g' | 'wifi5g' | 'wifi6g'> = {
      '2.4GHz': 'wifi2g',
      '5GHz': 'wifi5g',
      '6GHz': 'wifi6g'
    };

    for (const band of summary.WifiStatus || []) {
      const key = bandMap[band.Band];
      if (!key || !result.Dashboard.WiFi[key]) continue;
      result.Dashboard.WiFi[key] = {
        ...result.Dashboard.WiFi[key],
        Enable: Number(band.Enable) ? 1 : 0,
        SSID: band.SSID || result.Dashboard.WiFi[key].SSID,
        SecurityMode: band.Encryption || result.Dashboard.WiFi[key].SecurityMode,
        Password: (band.Encryption === 'none' || band.Encryption === 'owe')
          ? ''
          : result.Dashboard.WiFi[key].Password
      };
    }
  } catch (error) {
    console.warn('Failed to enrich dashboard with OpenWrt summary:', error);
  }

  return result;
};

export const getDashboardData = async (): Promise<DashboardResponse> => {
  if (isOpenWrtWifiLogoMode) {
    const mock = generateMockData();
    return applyOpenWrtSummaryToDashboard(mock);
  }

  if (isDevelopment) {
    return generateMockData();
  }

  const response = await callApi<Record<string, unknown>>('/API/info?list=Dashboard');

  if (typeof response?.NOK === 'string' && response.NOK.trim() !== '') {
    throw new Error(response.NOK);
  }

  const dashboard = response?.Dashboard;
  if (!dashboard || typeof dashboard !== 'object') {
    throw new Error('Invalid dashboard response: missing Dashboard object');
  }

  return response as unknown as DashboardResponse;
};

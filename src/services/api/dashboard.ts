import { callApi } from '../apiClient';
import type { DashboardResponse } from '../../types/dashboard';

const isDevelopment = import.meta.env.DEV;

// Store previous values for realistic fluctuations
let previousValues = {
  memory: {
    free: 340448
  },
  cpu: {
    usage: 45
  },
  network: {
    wan: {
      bytesSent: 15460119,
      bytesReceived: 378986963,
      packetsSent: 179645,
      packetsReceived: 326093,
      lastUpdate: Date.now()
    },
    wifi: {
      '2_4GHz': {
        bytesSent: 83058834,
        bytesReceived: 15000000,
        packetsSent: 166284,
        packetsReceived: 35000,
        lastUpdate: Date.now()
      },
      '5GHz': {
        bytesSent: 83058242,
        bytesReceived: 25000000,
        packetsSent: 166281,
        packetsReceived: 45000,
        lastUpdate: Date.now()
      },
      '6GHz': {
        bytesSent: 83058074,
        bytesReceived: 20000000,
        packetsSent: 166280,
        packetsReceived: 40000,
        lastUpdate: Date.now()
      }
    }
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

// Helper function to generate realistic network traffic changes
const updateNetworkStats = (previous: number, minRate: number, maxRate: number) => {
  const now = Date.now();
  const timeDiff = (now - previousValues.network.wan.lastUpdate) / 1000; // Convert to seconds
  const bytesPerSecond = getFluctuation(minRate, maxRate);
  const increase = Math.floor(bytesPerSecond * timeDiff);
  return previous + increase;
};

// Generate mock data with realistic variations
const generateMockData = (): DashboardResponse => {
  const now = Date.now();
  const timeDiff = (now - previousValues.network.wan.lastUpdate) / 1000;

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

  // Update WAN statistics with realistic rates
  const wanStats = {
    bytesSent: updateNetworkStats(previousValues.network.wan.bytesSent, 100000, 500000), // 100KB/s - 500KB/s
    bytesReceived: updateNetworkStats(previousValues.network.wan.bytesReceived, 200000, 1000000), // 200KB/s - 1MB/s
    packetsSent: Math.floor(updateNetworkStats(previousValues.network.wan.packetsSent, 100, 500)),
    packetsReceived: Math.floor(updateNetworkStats(previousValues.network.wan.packetsReceived, 200, 1000))
  };
  previousValues.network.wan = {
    ...wanStats,
    lastUpdate: now
  };

  // Update WiFi statistics for each band with realistic rates
  const updateWiFiBand = (band: keyof typeof previousValues.network.wifi) => {
    const stats = {
      bytesSent: updateNetworkStats(previousValues.network.wifi[band].bytesSent, 50000, 2000000), // 50KB/s - 2000KB/s
      bytesReceived: updateNetworkStats(previousValues.network.wifi[band].bytesReceived, 75000, 3000000), // 75KB/s - 3000KB/s
      packetsSent: Math.floor(updateNetworkStats(previousValues.network.wifi[band].packetsSent, 50, 200)),
      packetsReceived: Math.floor(updateNetworkStats(previousValues.network.wifi[band].packetsReceived, 75, 300))
    };
    previousValues.network.wifi[band] = {
      ...stats,
      lastUpdate: now
    };
    return stats;
  };

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
        "2_4GHz": {
          BytesSent: updateWiFiBand('2_4GHz').bytesSent,
          PacketsSent: updateWiFiBand('2_4GHz').packetsSent,
          BytesReceived: updateWiFiBand('2_4GHz').bytesReceived,
          PacketsReceived: updateWiFiBand('2_4GHz').packetsReceived
        },
        "5GHz": {
          BytesSent: updateWiFiBand('5GHz').bytesSent,
          PacketsSent: updateWiFiBand('5GHz').packetsSent,
          BytesReceived: updateWiFiBand('5GHz').bytesReceived,
          PacketsReceived: updateWiFiBand('5GHz').packetsReceived
        },
        "6GHz": {
          BytesSent: updateWiFiBand('6GHz').bytesSent,
          PacketsSent: updateWiFiBand('6GHz').packetsSent,
          BytesReceived: updateWiFiBand('6GHz').bytesReceived,
          PacketsReceived: updateWiFiBand('6GHz').packetsReceived
        }
      },
      WAN: {
        IPv4Address: "192.168.11.4",
        IPv6Address: "fdea:e111:ce6b:0:f091:c3ff:fe8f:c02c",
        BytesReceived: 315237055,
        BytesSent: 30098693,
        PacketsReceived: 344314,
        PacketsSent: 202629
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

export const getDashboardData = async (): Promise<DashboardResponse> => {
  if (isDevelopment) {
    return generateMockData();
  }

  return callApi<DashboardResponse>('/API/info?list=Dashboard');
};
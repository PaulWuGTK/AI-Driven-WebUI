import type { SystemStatsResponse } from '../../types/systemStats';
import { callApi } from '../apiClient';

const isDevelopment = import.meta.env.DEV;

// Generate mock data with realistic fluctuations
const generateMockData = (): SystemStatsResponse => {
  // Helper function to generate random bytes count
  const randomBytes = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min) + min).toString();
  };

  return {
    StatusSystemStat: {
      WAN: [
        {
          Receive: randomBytes(600000000, 700000000),
          Sent: randomBytes(150000000, 200000000),
          interface: "ETH0"
        },
        {
          Receive: randomBytes(300000000, 400000000),
          Sent: randomBytes(100000000, 150000000),
          interface: "ANIO_wan8"
        }
      ],
      LAN: [
        {
          Receive: randomBytes(150000000, 200000000),
          Sent: randomBytes(600000000, 700000000),
          interface: "ETH1"
        },
        {
          Receive: randomBytes(100000000, 150000000),
          Sent: randomBytes(300000000, 400000000),
          interface: "ETH2"
        }
      ],
      WiFi: {
        wifi2g: {
          Receive: randomBytes(0, 1000000),
          Sent: randomBytes(70000000, 80000000)
        },
        wifi5g: {
          Receive: randomBytes(300000, 400000),
          Sent: randomBytes(70000000, 80000000)
        },
        wifi6g: {
          Receive: randomBytes(0, 500000),
          Sent: randomBytes(70000000, 80000000)
        }
      }
    }
  };
};

export const getSystemStats = async (): Promise<SystemStatsResponse> => {
  if (isDevelopment) {
    return generateMockData();
  }

  return callApi<SystemStatsResponse>('/API/info?list=ThroughputStat');
};
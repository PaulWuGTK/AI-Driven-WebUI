import type { SpeedTestResponse } from '../../types/speedtest';
import { callApi } from '../apiClient';

const isDevelopment = import.meta.env.DEV;

export const runSpeedTest = async (): Promise<SpeedTestResponse> => {
  if (isDevelopment) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock data with new format
    return {
      AppXperienceControl: {
        status_code: 300,
        data: {
          download_udp: {
            throughput: Math.floor(Math.random() * 1000) + 500
          },
          upload_udp: {
            throughput: Math.floor(Math.random() * 500) + 200
          },
          ping: {
            packet_loss: Math.random() < 0.8 ? 0 : Math.floor(Math.random() * 5),
            min_echo_time: Math.floor(Math.random() * 10) + 10,
            mean_echo_time: Math.floor(Math.random() * 10) + 15,
            max_echo_time: Math.floor(Math.random() * 10) + 20
          }
        }
      }
    };
  }

  return callApi<SpeedTestResponse>('/API/info?list=AppXperienceControl', {
    method: 'POST',
    body: JSON.stringify({AppXperienceControl:""})
  });
};

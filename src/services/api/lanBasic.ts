import type { LanBasicResponse, LanBasicUpdateRequest, DeviceConnectedResponse } from '../../types/lanBasic';
import { handleApiResponse } from '../../utils/apiUtils';

const isDevelopment = import.meta.env.DEV;

export const getLanBasic = async (): Promise<LanBasicResponse> => {
  if (isDevelopment) {
    return {
      LanBasic: {
        LANIPSetting: {
          Enable: 1,
          IPAddress: "192.168.1.1",
          SubnetMask: "255.255.255.0"
        },
        DHCPv4Setting: {
          Enable: 1,
          DNSServers: "192.168.1.1",
          BeginAddress: "192.168.1.2",
          EndAddress: "192.168.1.254",
          SubnetMask: "255.255.255.0",
          LeaseTime: 43200
        },
        IPAddressReservation: [
          {
            MACAddress: "68:05:CA:00:ED:33",
            IPAddress: "192.168.1.168",
            Enable: 1
          }
        ]
      }
    };
  }

  const response = await fetch('/API/info?list=LanBasic');
  return handleApiResponse<LanBasicResponse>(response);
};

export const getDeviceConnected = async (): Promise<DeviceConnectedResponse> => {
  if (isDevelopment) {
    return {
      LanDeviceConnected: [
        {
          Host: "PC-ID-b8e2b3f2-d76e-49a1-aee8-20e8f0743f4c",
          IPAddress: "192.168.101.3",
          MACAddress: "CE:E7:61:ED:D6:15"
        },
        {
          Host: "PC-ID-74091540-2c22-4b92-89a5-ef67d75656d5",
          IPAddress: "192.168.101.2",
          MACAddress: "B0:0C:D1:52:A5:DE"
        }
      ]
    };
  }

  const response = await fetch('/API/info?list=LanDeviceConnected');
  return handleApiResponse<DeviceConnectedResponse>(response);
};

export const updateLanBasic = async (data: LanBasicUpdateRequest): Promise<LanBasicResponse> => {
  if (isDevelopment) {
    console.log('Update LAN Basic:', data);
    return getLanBasic();
  }

  const response = await fetch('/API/info?list=LanBasic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse<LanBasicResponse>(response);
};
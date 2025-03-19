import type { LanBasicResponse, LanBasicUpdateRequest } from '../../types/lanBasic';
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
        ],
        DeviceConnected: [
          {
            Host: "22026021-PC01",
            MACAddress: "68:05:CA:00:ED:33",
            IPAddress: "192.168.101.168"
          }
        ]
      }
    };
  }

  const response = await fetch('/API/info?list=LanBasic');
  return handleApiResponse<LanBasicResponse>(response);
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
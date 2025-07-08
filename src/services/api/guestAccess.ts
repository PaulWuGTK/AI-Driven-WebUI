import type { 
  GuestWiFiResponse, 
  GuestWiFiUpdateRequest, 
  GuestLANResponse, 
  GuestLANUpdateRequest,
  GuestDeviceConnectedResponse
} from '../../types/guest';
import { handleApiResponse } from '../../utils/apiUtils';
import { callApi } from '../apiClient';

const isDevelopment = import.meta.env.DEV;

// Guest WiFi API
export const getGuestWiFi = async (): Promise<GuestWiFiResponse> => {
  if (isDevelopment) {
    return {
      GuestWiFi: {
        Enable: 0,
        MLOEnable: 0,
        MeshEnable: 1,
        Password: "password",
        SecurityMode: "WPA3-Personal",
        SSID: "prplOS-guest-2g",
        SecurityModeAvailable: "WPA3-Personal,WPA2-WPA3-Personal"
      }
    };
  }
  return callApi<GuestWiFiResponse>('/API/info?list=GuestWiFi');
};

export const updateGuestWiFi = async (data: GuestWiFiUpdateRequest): Promise<GuestWiFiResponse> => {
  if (isDevelopment) {
    console.log('Update Guest WiFi:', data);
    return {
      GuestWiFi: {
        ...data.GuestWiFi,
        SecurityModeAvailable: "WPA3-Personal,WPA2-WPA3-Personal"
      }
    };
  }

  const response = await fetch('/API/info?list=GuestWiFi', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse<GuestWiFiResponse>(response);
};

// Guest LAN API
export const getGuestLAN = async (): Promise<GuestLANResponse> => {
  if (isDevelopment) {
    return {
      GuestLAN: {
        GUESTIPSetting: {
          Enable: 1,
          IPAddress: "192.168.2.1",
          SubnetMask: "255.255.255.0"
        },
        DHCPv4Setting: {
          Enable: 1,
          DNSServers: "192.168.2.1",
          BeginAddress: "192.168.2.2",
          EndAddress: "192.168.2.254",
          SubnetMask: "255.255.255.0",
          LeaseTime: "43200"
        }
      }
    };
  }
  return callApi<GuestLANResponse>('/API/info?list=GuestLAN');
};

export const updateGuestLAN = async (data: GuestLANUpdateRequest): Promise<GuestLANResponse> => {
  if (isDevelopment) {
    console.log('Update Guest LAN:', data);
    return {
      GuestLAN: {
        GUESTIPSetting: data.GuestLAN.GUESTIPSetting,
        DHCPv4Setting: {
          ...data.GuestLAN.DHCPv4Setting,
          LeaseTime: String(data.GuestLAN.DHCPv4Setting.LeaseTime)
        }
      }
    };
  }

  const response = await fetch('/API/info?list=GuestLAN', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse<GuestLANResponse>(response);
};

// Guest Device Connected API
export const getGuestDeviceConnected = async (): Promise<GuestDeviceConnectedResponse> => {
  if (isDevelopment) {
    return {
      GuestDeviceConnected: [
        {
          Host: "PC-ID-f96007f3-30f7-47ab-83fd-ea184256a1ef",
          IPAddress: "192.168.2.168",
          MACAddress: "68:05:CA:00:ED:33"
        }
      ]
    };
  }
  return callApi<GuestDeviceConnectedResponse>('/API/info?list=GuestDeviceConnected');
};
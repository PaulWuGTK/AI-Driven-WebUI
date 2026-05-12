import type {
  OpenWrtActionResult,
  OpenWrtWifiApplyRequest,
  OpenWrtWifiApplyResponse,
  OpenWrtWifiBasicRequest,
  OpenWrtWifiBasicResponse,
  OpenWrtAuthentication
} from '../../types/openwrtWifi';
import { callApi } from '../apiClient';

const API_BASE = import.meta.env.VITE_OPENWRT_API_BASE || '/cgi-bin/api/openwrt/v1';
const isDevelopment = import.meta.env.DEV;

const wifiBasicMock: OpenWrtWifiBasicResponse = {
  WifiBasic: {
    Bands: [
      {
        Band: '2.4GHz',
        Radio: 'radio0_band0',
        Iface: 'default_radio0_band0',
        Enable: 1,
        SSID: 'OpenWrt-2G',
        Authentication: 'psk2',
        Password: '12345678',
        HideSSID: 0,
        IsolationEnable: 0,
        AuthOptions: ['none', 'owe', 'psk2', 'sae', 'sae-mixed']
      },
      {
        Band: '5GHz',
        Radio: 'radio0_band1',
        Iface: 'default_radio0_band1',
        Enable: 1,
        SSID: 'OpenWrt-5G',
        Authentication: 'none',
        Password: '',
        HideSSID: 0,
        IsolationEnable: 0,
        AuthOptions: ['none', 'owe', 'psk2', 'sae', 'sae-mixed']
      },
      {
        Band: '6GHz',
        Radio: 'radio0_band2',
        Iface: 'default_radio0_band2',
        Enable: 1,
        SSID: 'OpenWrt-6G',
        Authentication: 'sae',
        Password: '12345678',
        HideSSID: 0,
        IsolationEnable: 0,
        AuthOptions: ['none', 'owe', 'psk2', 'sae', 'sae-mixed']
      }
    ]
  }
};

function normalizeAuth(auth: OpenWrtAuthentication): string {
  return String(auth || '').trim().toLowerCase();
}

export function isPasswordRequiredForAuthentication(auth: OpenWrtAuthentication): boolean {
  const normalized = normalizeAuth(auth);
  return normalized !== 'none' && normalized !== 'owe';
}

export function normalizeOpenWrtWifiBasicRequest(payload: OpenWrtWifiBasicRequest): OpenWrtWifiBasicRequest {
  return {
    WifiBasic: {
      Bands: (payload.WifiBasic?.Bands || []).map((band) => {
        if (!isPasswordRequiredForAuthentication(band.Authentication)) {
          return {
            ...band,
            Password: ''
          };
        }
        return band;
      })
    }
  };
}

export async function getOpenWrtWifiBasic(): Promise<OpenWrtWifiBasicResponse> {
  if (isDevelopment) {
    return wifiBasicMock;
  }
  return callApi<OpenWrtWifiBasicResponse>(`${API_BASE}/wifi/basic`);
}

export async function updateOpenWrtWifiBasic(payload: OpenWrtWifiBasicRequest): Promise<OpenWrtActionResult> {
  const normalizedPayload = normalizeOpenWrtWifiBasicRequest(payload);

  if (isDevelopment) {
    return {
      result: 'Success',
      reason: '',
      applyRequired: 1
    };
  }

  return callApi<OpenWrtActionResult>(`${API_BASE}/wifi/basic`, {
    method: 'POST',
    body: JSON.stringify(normalizedPayload)
  });
}

export async function applyOpenWrtWifi(payload: OpenWrtWifiApplyRequest = { Apply: { Target: 'wireless' } }): Promise<OpenWrtWifiApplyResponse> {
  if (isDevelopment) {
    return {
      result: 'Success',
      reason: ''
    };
  }

  return callApi<OpenWrtWifiApplyResponse>(`${API_BASE}/wifi/apply`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

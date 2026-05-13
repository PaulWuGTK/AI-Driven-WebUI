import { isOpenWrtWifiLogoMode } from '../../config/runtimeMode';
import type {
  WlanBasicResponse,
  WlanAdvancedResponse,
  WlanWpsResponse,
  WlanMeshResponse
} from '../../types/wireless';
import type { WlanBasicMultiGetResponse, WlanBasicMultiPostRequest } from '../../types/wlanBasicMulti';
import type { OpenWrtAuthentication, OpenWrtWifiBandConfig, OpenWrtWifiBasicRequest } from '../../types/openwrtWifi';
import { callApi } from '../apiClient';
import {
  wlanBasicMockData,
  wlanBasicMultiMockData,
  wlanAdvancedMockData,
  getWlanWpsMock,
  updateWlanWpsMock,
  wlanMeshMockData
} from '../mockData/wirelessMockData';
import { applyOpenWrtWifi, getOpenWrtWifiBasic, updateOpenWrtWifiBasic } from '../api-openwrt';

const API_URL = '/API/info';
const isDevelopment = import.meta.env.DEV;
const useLegacyMock = import.meta.env.DEV || isOpenWrtWifiLogoMode;

const BAND_ORDER = ['2.4GHz', '5GHz', '6GHz'];

const OPENWRT_TO_CHT_AUTH: Record<string, string> = {
  none: 'None',
  owe: 'OWE',
  psk2: 'WPA2-Personal',
  sae: 'WPA3-Personal',
  'sae-mixed': 'WPA2-WPA3-Personal'
};

const CHT_TO_OPENWRT_AUTH: Record<string, string> = {
  none: 'none',
  owe: 'owe',
  'wpa2-personal': 'psk2',
  'wpa3-personal': 'sae',
  'wpa2-wpa3-personal': 'sae-mixed'
};

let lastOpenWrtBandByName: Record<string, OpenWrtWifiBandConfig> = {};

const normalizeBool01 = (value: unknown): 0 | 1 =>
  Number(value) === 1 || value === true || value === '1' ? 1 : 0;

const toChtSecurityMode = (openwrtAuth: string): string => {
  const key = String(openwrtAuth || '').trim().toLowerCase();
  return OPENWRT_TO_CHT_AUTH[key] || openwrtAuth || 'None';
};

const toOpenWrtSecurityMode = (chtMode: string): OpenWrtAuthentication => {
  const key = String(chtMode || '').trim().toLowerCase();
  return (CHT_TO_OPENWRT_AUTH[key] || key || 'none') as OpenWrtAuthentication;
};

const toChtSecurityModeCsv = (authOptions?: string[]): string => {
  const mapped = (authOptions || [])
    .map((item) => toChtSecurityMode(item))
    .filter((item, idx, arr) => item && arr.indexOf(item) === idx);

  if (!mapped.length) {
    return 'None,OWE,WPA2-Personal,WPA3-Personal,WPA2-WPA3-Personal';
  }
  return mapped.join(',');
};

const deriveCommonSsidEnable = (interfaces: Array<{ SSID: string; SecurityMode: string; KeyPassPhrase: string; SSIDAdvertisementEnabled: 0 | 1; IsolationEnable: 0 | 1 }>): 0 | 1 => {
  if (interfaces.length <= 1) return 1;
  const [head, ...tail] = interfaces;
  const same = tail.every((itf) =>
    itf.SSID === head.SSID &&
    itf.SecurityMode === head.SecurityMode &&
    (itf.KeyPassPhrase || '') === (head.KeyPassPhrase || '') &&
    itf.SSIDAdvertisementEnabled === head.SSIDAdvertisementEnabled &&
    itf.IsolationEnable === head.IsolationEnable
  );
  return same ? 1 : 0;
};

const sortByBandOrder = <T extends { Band: string }>(items: T[]): T[] => {
  return items.slice().sort((a, b) => {
    const ai = BAND_ORDER.indexOf(a.Band);
    const bi = BAND_ORDER.indexOf(b.Band);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
};

export async function getWlanBasic(): Promise<WlanBasicResponse> {
  if (useLegacyMock) {
    return wlanBasicMockData;
  }
  return callApi<WlanBasicResponse>(`${API_URL}?list=WlanBasic`);
}

export async function updateWlanBasic(data: Partial<WlanBasicResponse>): Promise<WlanBasicResponse> {
  if (useLegacyMock) {
    return wlanBasicMockData;
  }
  return callApi<WlanBasicResponse>(`${API_URL}?list=WlanBasic`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * PUBLIC_INTERFACE
 * Fetch Basic WLAN configuration in the new multi-SSID WlanGroup schema.
 */
export async function getWlanBasicMulti(): Promise<WlanBasicMultiGetResponse> {
  if (isOpenWrtWifiLogoMode) {
    const response = await getOpenWrtWifiBasic();
    const bands = sortByBandOrder(response.WifiBasic.Bands || []);

    lastOpenWrtBandByName = {};
    for (const band of bands) {
      lastOpenWrtBandByName[band.Band] = { ...band };
    }

    const interfaces = bands.map((band) => ({
      Alias: band.Iface,
      Band: band.Band,
      Enable: normalizeBool01(band.Enable),
      SSID: band.SSID || '',
      SecurityMode: toChtSecurityMode(band.Authentication),
      SecurityModeAvailable: toChtSecurityModeCsv(band.AuthOptions),
      KeyPassPhrase: band.Password || '',
      MFPConfig: '',
      AccessPointReference: '',
      SSIDReference: '',
      SSIDAdvertisementEnabled: normalizeBool01(Number(band.HideSSID) ? 0 : 1),
      IsolationEnable: normalizeBool01(band.IsolationEnable)
    }));

    const commonSSIDEnable = deriveCommonSsidEnable(interfaces.map((itf) => ({
      SSID: itf.SSID,
      SecurityMode: itf.SecurityMode,
      KeyPassPhrase: itf.KeyPassPhrase || '',
      SSIDAdvertisementEnabled: itf.SSIDAdvertisementEnabled || 0,
      IsolationEnable: itf.IsolationEnable || 0
    })));

    const first = interfaces[0];

    return {
      WlanBasic: {
        WlanGroup: [
          {
            Index: 1,
            Enable: interfaces.some((itf) => Number(itf.Enable) === 1) ? 1 : 0,
            Alias: 'PRIV',
            SSID: first?.SSID || '',
            SecurityMode: first?.SecurityMode || 'None',
            KeyPassPhrase: first?.KeyPassPhrase || '',
            CommonSSIDEnable: commonSSIDEnable,
            MLOEnable: 0,
            SecurityModeAvailable: first?.SecurityModeAvailable || 'None,OWE,WPA2-Personal,WPA3-Personal,WPA2-WPA3-Personal',
            SSIDAdvertisementEnabled: first?.SSIDAdvertisementEnabled || 1,
            IsolationEnable: first?.IsolationEnable || 0,
            Interface: interfaces
          }
        ]
      }
    };
  }

  if (useLegacyMock) {
    return wlanBasicMultiMockData;
  }

  const rawResponse = await callApi<any>(`${API_URL}?list=WlanGroup`);

  if (rawResponse.WlanGroup) {
    const transformedGroups = rawResponse.WlanGroup.map((group: any) => ({
      ...group,
      SSIDGroupName: group.Alias || group.SSIDGroupName || 'Unknown',
      CommonSSIDBandSetting: group.CommonSSIDBandSetting || []
    }));

    return {
      WlanBasic: {
        WlanGroup: transformedGroups
      }
    };
  }

  return rawResponse;
}

/**
 * PUBLIC_INTERFACE
 * Update Basic WLAN configuration in the new multi-SSID WlanGroup schema.
 */
export async function updateWlanBasicMulti(data: WlanBasicMultiPostRequest): Promise<unknown> {
  if (isOpenWrtWifiLogoMode) {
    const targetGroup = (data.WlanGroup || [])[0];
    if (!targetGroup) {
      return { result: 'Fail', reason: 'Missing WlanGroup payload' };
    }

    const interfaceEnableOverride: Record<string, 0 | 1> = {};
    for (const item of targetGroup.Interface || []) {
      interfaceEnableOverride[item.Band] = normalizeBool01(item.Enable);
    }

    const requestBands: OpenWrtWifiBandConfig[] = sortByBandOrder(targetGroup.Interface || []).map((iface) => {
      const commonEnabled = normalizeBool01(targetGroup.CommonSSIDEnable) === 1;
      const base = lastOpenWrtBandByName[iface.Band];

      const resolvedSSID = commonEnabled ? (targetGroup.SSID || iface.SSID || '') : (iface.SSID || '');
      const resolvedSecurity = commonEnabled
        ? (targetGroup.SecurityMode || iface.SecurityMode || 'None')
        : (iface.SecurityMode || 'None');
      const resolvedPassword = commonEnabled
        ? (targetGroup.KeyPassPhrase || iface.KeyPassPhrase || '')
        : (iface.KeyPassPhrase || '');
      const resolvedAdvertisement = commonEnabled
        ? normalizeBool01(targetGroup.SSIDAdvertisementEnabled ?? 1)
        : normalizeBool01(iface.SSIDAdvertisementEnabled ?? 1);
      const resolvedIsolation = commonEnabled
        ? normalizeBool01(targetGroup.IsolationEnable ?? 0)
        : normalizeBool01(iface.IsolationEnable ?? 0);

      return {
        Band: iface.Band,
        Radio: base?.Radio || '',
        Iface: base?.Iface || iface.Alias || '',
        Enable: interfaceEnableOverride[iface.Band] ?? normalizeBool01(iface.Enable),
        SSID: resolvedSSID,
        Authentication: toOpenWrtSecurityMode(resolvedSecurity),
        Password: resolvedPassword,
        HideSSID: resolvedAdvertisement === 1 ? 0 : 1,
        IsolationEnable: resolvedIsolation,
        AuthOptions: base?.AuthOptions
      };
    });

    const requestPayload: OpenWrtWifiBasicRequest = {
      WifiBasic: {
        Bands: requestBands
      }
    };

    const updateResult = await updateOpenWrtWifiBasic(requestPayload);
    if (updateResult.result !== 'Success') {
      return updateResult;
    }

    if (updateResult.applyRequired === 1) {
      const applyResult = await applyOpenWrtWifi();
      return applyResult;
    }

    return updateResult;
  }

  if (useLegacyMock) {
    return data;
  }

  return callApi<unknown>(`${API_URL}?list=WlanGroup`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function getWlanAdvanced(): Promise<WlanAdvancedResponse> {
  if (useLegacyMock) {
    return wlanAdvancedMockData;
  }
  return callApi<WlanAdvancedResponse>(`${API_URL}?list=WlanAdvanced`);
}

export async function updateWlanAdvanced(data: WlanAdvancedResponse): Promise<WlanAdvancedResponse> {
  if (useLegacyMock) {
    return wlanAdvancedMockData;
  }

  return callApi<WlanAdvancedResponse>(`${API_URL}?list=WlanAdvanced`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function getWlanWps(): Promise<WlanWpsResponse> {
  if (useLegacyMock) {
    return getWlanWpsMock();
  }

  return callApi<WlanWpsResponse>(`${API_URL}?list=WlanWps`);
}

export async function updateWlanWps(data: { WlanWps: { Enable?: number; Action?: string; ClientPIN?: number } }): Promise<WlanWpsResponse> {
  if (useLegacyMock) {
    return updateWlanWpsMock(data);
  }
  return callApi<WlanWpsResponse>(`${API_URL}?list=WlanWps`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function getWlanMesh(): Promise<WlanMeshResponse> {
  if (useLegacyMock) {
    return wlanMeshMockData;
  }
  return callApi<WlanMeshResponse>(`${API_URL}?list=WlanMesh`);
}

export async function updateWlanMesh(data: WlanMeshResponse): Promise<WlanMeshResponse> {
  if (useLegacyMock) {
    return wlanMeshMockData;
  }
  return callApi<WlanMeshResponse>(`${API_URL}?list=WlanMesh`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

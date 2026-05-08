import type { OpenWrtHomeSummaryResponse } from '../../types/openwrtHome';
import { callApi } from '../apiClient';

const API_BASE = '/api/openwrt/v1';
const isDevelopment = import.meta.env.DEV;

const homeSummaryMock: OpenWrtHomeSummaryResponse = {
  HomeSummary: {
    FirmwareVersion: 'OpenWrt 24.10-SNAPSHOT r0-demo',
    FirmwareRevision: 'r0-demo',
    ModelName: 'OpenWrt Demo Board',
    BoardName: 'openwrt,demo-board',
    LanIPv4: '192.168.1.1',
    WanLinkUp: false,
    UptimeSec: 0,
    WifiStatus: [
      { Band: '2.4GHz', Radio: 'radio0_band0', Enable: 1, SSID: 'OpenWrt-2G', Encryption: 'psk2' },
      { Band: '5GHz', Radio: 'radio0_band1', Enable: 1, SSID: 'OpenWrt-5G', Encryption: 'psk2' },
      { Band: '6GHz', Radio: 'radio0_band2', Enable: 0, SSID: 'OpenWrt-6G', Encryption: 'sae' }
    ]
  }
};

export async function getOpenWrtHomeSummary(): Promise<OpenWrtHomeSummaryResponse> {
  if (isDevelopment) {
    return homeSummaryMock;
  }
  return callApi<OpenWrtHomeSummaryResponse>(`${API_BASE}/home/summary`);
}

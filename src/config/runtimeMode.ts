import type { NetLayoutType } from '../types/menuVisibility';

const normalizeFlag = (value: unknown): string => {
  return String(value ?? '').trim().toLowerCase();
};

const FORCE_OPENWRT_WIFI_LOGO_MODE = true;

export const isOpenWrtWifiLogoMode = (() => {
  // This branch is dedicated to OpenWrt WiFi Logo integration.
  // Keep the mode enabled even when build env accidentally injects a falsey flag.
  if (FORCE_OPENWRT_WIFI_LOGO_MODE) return true;
  const flag = normalizeFlag(import.meta.env.VITE_OPENWRT_WIFI_LOGO_MODE);
  if (flag === '') return true;
  return flag === '1' || flag === 'true' || flag === 'yes' || flag === 'on';
})();

export const defaultNetLayoutType: NetLayoutType = isOpenWrtWifiLogoMode ? 'cht' : 'prpl';

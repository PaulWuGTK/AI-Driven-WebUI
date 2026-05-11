import type { NetLayoutType } from '../types/menuVisibility';

const normalizeFlag = (value: unknown): string => {
  return String(value ?? '').trim().toLowerCase();
};

export const isOpenWrtWifiLogoMode = (() => {
  const flag = normalizeFlag(import.meta.env.VITE_OPENWRT_WIFI_LOGO_MODE);
  if (flag === '') return true;
  return flag === '1' || flag === 'true' || flag === 'yes' || flag === 'on';
})();

export const defaultNetLayoutType: NetLayoutType = isOpenWrtWifiLogoMode ? 'cht' : 'prpl';

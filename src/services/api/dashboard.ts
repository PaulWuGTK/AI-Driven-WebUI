import { isDevelopment } from '../config';
import {
  getSystemMockData,
  getCpuMockData,
  getMemoryMockData,
  getWanMockData,
  getWifiMockData,
  getEthernetMockData
} from '../mockData/dashboard';

export const getSystemInfo = async () => {
  if (isDevelopment) {
    return getSystemMockData();
  }
  const response = await fetch('/serviceElements/Device.DeviceInfo.');
  return response.json();
};

export const getCpuInfo = async () => {
  if (isDevelopment) {
    return getCpuMockData();
  }
  const response = await fetch('/serviceElements/Device.DeviceInfo.');
  return response.json();
};

export const getMemoryInfo = async () => {
  if (isDevelopment) {
    return getMemoryMockData();
  }
  const response = await fetch('/serviceElements/Device.DeviceInfo.');
  return response.json();
};

export const getWanInfo = async () => {
  if (isDevelopment) {
    return getWanMockData();
  }
  const response = await fetch('/API/info?list=EthernetStatus');
  return response.json();
};

export const getWifiInfo = async () => {
  if (isDevelopment) {
    return getWifiMockData();
  }
  const response = await fetch('/serviceElements/Device.WiFi.');
  return response.json();
};

export const getEthernetInfo = async () => {
  if (isDevelopment) {
    return getEthernetMockData();
  }
  const response = await fetch('/API/info?list=EthernetStatus');
  return response.json();
};
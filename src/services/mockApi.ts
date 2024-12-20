import type { WanStatusResponse } from '../types/wan';
import type { LanStatusResponse } from '../types/lan';
import type { WlanStatusResponse } from '../types/wlan';
import { wanMockData } from './mockData/wanMockData';
import { lanMockData } from './mockData/lanMockData';
import { wlanMockData } from './mockData/wlanMockData';

export const getMockWanStatus = (): WanStatusResponse => wanMockData;
export const getMockLanStatus = (): LanStatusResponse => lanMockData;
export const getMockWlanStatus = (): WlanStatusResponse => wlanMockData;
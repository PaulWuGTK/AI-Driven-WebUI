import apiClient from '../apiClient';
import type { BasicWanChtResponse, BasicWanChtConfig } from '../../types/basicWanCht';
import { basicWanChtMockData } from '../mockData/basicWanChtMockData';

const isDevelopment = import.meta.env.DEV;

export const basicWanChtApi = {
  async getConfig(): Promise<BasicWanChtConfig> {
    if (isDevelopment) {
      return basicWanChtMockData.BasicWanCht;
    }
    const response = await apiClient.get<BasicWanChtResponse>('/API/info?list=BasicWanCht');
    return response.BasicWanCht;
  },

  async updateConfig(config: BasicWanChtConfig): Promise<void> {
    if (isDevelopment) {
      console.log('Mock: Updated BasicWanCht config:', config);
      return Promise.resolve();
    }

    const { ListConnectionTrigger, ListDNSMode, ...pppoeData } = config.PPPoE;
    const { ListProtocol, ListDNSMode: ipoeListDNSMode, ...ipoeBaseData } = config.IPoE;
    const { ListSupportedLANInterfaces, ...bridgeData } = config.Bridge;
    const ipoeData = {
      ...ipoeBaseData,
      Status: config.IPoE.Status ?? (config.IPoE.Enable ? 'Enabled' : 'Disabled')
    };

    const postData = {
      PPPoE: pppoeData,
      IPoE: ipoeData,
      Bridge: bridgeData
    };

    await apiClient.post('/API/info?list=BasicWanCht', {
      BasicWanCht: postData
    });
  }
};

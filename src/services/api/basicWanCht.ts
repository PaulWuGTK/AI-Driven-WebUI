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
    await apiClient.post('/API/info?list=BasicWanCht', {
      BasicWanCht: config
    });
  }
};

import { getQosBandwidth, updateQosBandwidth, getQosRule, updateQosRule } from '../api';
import type {
  QosBandwidthResponse,
  QosBandwidthConfig,
  QosRuleResponse,
  QosRuleRequest
} from '../../types/qos';

export const qosApi = {
  getBandwidth: async (): Promise<QosBandwidthResponse> => {
    return getQosBandwidth();
  },

  updateBandwidth: async (config: { QosBandwidth: QosBandwidthConfig }): Promise<void> => {
    await updateQosBandwidth(config);
  },

  getRule: async (): Promise<QosRuleResponse> => {
    return getQosRule();
  },

  updateRule: async (config: QosRuleRequest): Promise<void> => {
    await updateQosRule(config);
  }
};

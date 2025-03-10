import type { WanModeSetupResponse } from '../../types/wanSetup';

export const wanModeSetupMockData: WanModeSetupResponse = {
  WanModeSetup: {
    OperationMode: "Manual",
    WANMode: "demo_wanmode",
    WANModeList: [
      "demo_wanmode",
      "Ethernet_DHCP",
      "Ethernet_PPP",
      "Ethernet_PPP6",
      "GPON_DHCP",
      "GPON_PPP6",
      "Ethernet_bridged",
      "GPON_bridged"
    ]
  }
};
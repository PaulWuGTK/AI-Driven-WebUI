import type { 
  WlanBasicResponse, 
  WlanAdvancedResponse, 
  WlanWpsResponse, 
  WlanMeshResponse 
} from '../../types/wireless';

export const wlanBasicMockData: WlanBasicResponse = {
  WlanBasic: {
    wifi2g: {
      Password: "password",
      SecurityMode: "WPA2-Personal",
      SSID: "prplOS",
      Enable : 1,
      SecurityModeAvailable: "None,WPA-Personal,WPA2-Personal,WPA-WPA2-Personal,WPA3-Personal,WPA2-WPA3-Personal,WPA-Enterprise,WPA2-Enterprise,WPA-WPA2-Enterprise"
    },
    wifi5g: {
      Password: "password",
      SecurityMode: "WPA2-Personal",
      SSID: "prplOS",
      Enable : 1,
      SecurityModeAvailable: "None,WPA-Personal,WPA2-Personal,WPA-WPA2-Personal,WPA3-Personal,WPA2-WPA3-Personal,WPA-Enterprise,WPA2-Enterprise,WPA-WPA2-Enterprise"
    },
    wifi6g: {
      Password: "password",
      SecurityMode: "WPA3-Personal",
      SSID: "prplOS",
      Enable : 1,
      SecurityModeAvailable: "None,WPA3-Personal"
    }
  }
};

export const wlanAdvancedMockData: WlanAdvancedResponse = {
  WlanAdvanced: {
    wifi2g: {
      ModeList: "b,g,n,bg,gn,bgn,ax",
      ChannelBandwidthList: "20MHz,40MHz",
      ChannelBandwidth: "40MHz",
      Channel: 1,
      ChannelList: "1,2,3,4,5,6,7,8,9,10,11",
      Mode: "ax",
      AutoChannelEnable: 0,
      Band: "2.4GHz"
    },
    wifi5g: {
      ModeList: "a,n,an,ac,ax",
      ChannelBandwidthList: "20MHz,40MHz,80MHz,160MHz",
      ChannelBandwidth: "160MHz",
      Channel: 36,
      ChannelList: "36,40,44,48,52,56,60,64,100,104,108,112,116,120,124,128,132,136,140,144,149,153,157,161,165",
      Mode: "ax",
      AutoChannelEnable: 0,
      Band: "5GHz"
    },
    wifi6g: {
      ModeList: "ax",
      ChannelBandwidthList: "20MHz,40MHz,80MHz,160MHz,320MHz",
      ChannelBandwidth: "160MHz",
      Channel: 33,
      ChannelList: "1,187,5,9,13,17,21,25,29,33,37,41,45,49,53,57,61,65,69,73,77,81,85,89,93,97,101,105,109,113,117,121,125,129,133,137,141,145,149,153,157,161,165,169,173,177,181,185,189,193,197,201,205,209,213,217,221,225,229,233",
      Mode: "ax",
      AutoChannelEnable: 0,
      Band: "6GHz"
    }
  }
};

export const wlanWpsMockData: WlanWpsResponse = {
  WlanWps: {
    Enable: 1,
    PINCode: "60668011",
    Band: [
      {
        Band: "2.4GHz",
        SSID: "prplOS-2G",
        AuthType: "WPA2-Personal",
        ConnectStatus: "Disabled",
        EncryType: "AES",
        Configured: "Not Configured"
      },
      {
        Band: "5GHz",
        SSID: "prplOS-5G",
        AuthType: "WPA2-Personal",
        ConnectStatus: "Disabled",
        EncryType: "AES",
        Configured: "Configured"
      }
    ]
  }
};

export const wlanMeshMockData: WlanMeshResponse = {
  WlanMesh: {
    MeshEnable: "1",
    CommonSSID: "prplOS"
  }
};
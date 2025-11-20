import type { LoginResponse } from '../../types/auth';

export const loginMockData: LoginResponse & { wizardCheck?: boolean } = {
  absoluteTimeout: 3600,
  loginAttempts: 0,
  idleTimeout: 600,
  sessionID: "dfcyPRISVuLeKSiNSGeJyotChGxdIeSpM9fkHOWmqbfv7gUvKCAFqSufdcirgJwF",
  wizardCheck: true
};

export const wizardMockData = {
  Wizard: {
    wizardCheck: true,
    WANMode: "demo_wanmode",
    wifi: {
      CommonSSIDEnable: 1,
      MLOEnable: 1,
      MeshEnable: 1,
      wifimlo: {
        Enable: 1,
        SSID: "prplOS_prplmesh",
        SecurityMode: "WPA2-WPA3-Personal",
        SecurityModeAvailable: "WPA3-Personal,WPA2-WPA3-Personal",
        Password: "password"
      },
      wifi2g: {
        Enable: 0,
        SSID: "prplOS_prplmesh",
        SecurityMode: "WPA2-WPA3-Personal",
        SecurityModeAvailable: "None,WPA2-Personal,WPA3-Personal,WPA2-WPA3-Personal",
        Password: "password"
      },
      wifi5g: {
        Enable: 0,
        SSID: "prplOS_prplmesh",
        SecurityMode: "WPA2-WPA3-Personal",
        SecurityModeAvailable: "None,WPA2-Personal,WPA3-Personal,WPA2-WPA3-Personal",
        Password: "password"
      },
      wifi6g: {
        Enable: 0,
        SSID: "prplOS_prplmesh",
        SecurityMode: "WPA3-Personal",
        SecurityModeAvailable: "WPA3-Personal",
        Password: "password"
      }
    },
    MeshEnable: 1,
    modeList: ["router", "agent"],
    WANModeList: [
      "Cellular",
      "Cellular_IPv4",
      "Ethernet_DHCP",
      "Ethernet_PPP",
      "Ethernet_PPP6",
      "Ethernet_bridged",
      "GPON_DHCP",
      "GPON_PPP6",
      "GPON_bridged",
      "demo_wanmode"
    ]
  }
};
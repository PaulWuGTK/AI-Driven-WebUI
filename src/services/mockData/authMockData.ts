import type { LoginResponse } from '../../types/auth';

// ============================================
// 測試場景切換
// ============================================
// 改這裡可以測試不同的 OpMode 情況:
// - 'opmode_not_ready': OpMode 未 ready (空字串) - 應該重試
// - 'opmode_init': OpMode = "Init" - 導向 wizard
// - 'opmode_normal': OpMode = "Normal" / "Gateway" - 導向 dashboard
// - 'opmode_missing': 完全不回傳 opMode - 應該重試

export const TEST_SCENARIO: 'opmode_not_ready' | 'opmode_init' | 'opmode_normal' | 'opmode_missing' = 'opmode_not_ready';

// ============================================

export const loginMockData: LoginResponse = {
  absoluteTimeout: 3600,
  loginAttempts: 0,
  idleTimeout: 600,
  sessionID: "dfcyPRISVuLeKSiNSGeJyotChGxdIeSpM9fkHOWmqbfv7gUvKCAFqSufdcirgJwF"
};

function generateRandomCaptcha(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateCaptchaSVG(text: string): string {
  const svg = `<svg width="220" height="80" xmlns="http://www.w3.org/2000/svg">
    <rect width="220" height="80" fill="#f5f5f5"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#333" letter-spacing="12">${text}</text>
    <line x1="0" y1="25" x2="220" y2="25" stroke="#ddd" stroke-width="1" opacity="0.5"/>
    <line x1="0" y1="55" x2="220" y2="55" stroke="#ddd" stroke-width="1" opacity="0.5"/>
    <line x1="55" y1="0" x2="55" y2="80" stroke="#ddd" stroke-width="1" opacity="0.3"/>
    <line x1="110" y1="0" x2="110" y2="80" stroke="#ddd" stroke-width="1" opacity="0.3"/>
    <line x1="165" y1="0" x2="165" y2="80" stroke="#ddd" stroke-width="1" opacity="0.3"/>
  </svg>`;

  return btoa(unescape(encodeURIComponent(svg)));
}

const mockCaptchaText = generateRandomCaptcha();

export const captchaMockData = {
  LoginCaptcha: {
    captchaId: "mock-captcha-id-" + Date.now(),
    expiresIn: 60,
    captchaText: mockCaptchaText,
    imageBase64: generateCaptchaSVG(mockCaptchaText)
  }
};

export function getMockCaptcha() {
  const text = generateRandomCaptcha();
  return {
    LoginCaptcha: {
      captchaId: "mock-captcha-id-" + Date.now(),
      expiresIn: 60,
      imageBase64: generateCaptchaSVG(text)
    }
  };
}

export function getMockLoginConfig() {
  return {
    Login: {
      language: {
        current: 'en',
        available: ['en', 'fr', 'ja', 'de', 'zh-TW', 'zh-CN', 'ko']
      },
      captchaEnable: 1
    }
  };
}

// ============================================
// OpMode 測試場景
// ============================================
const wizardScenarios = {
  opmode_not_ready: {
    WizardRouter: {
      ModelName: "WREQ-130BE-PRPL",
      OpMode: "",  // 👈 空字串 - 模擬未 ready
      Wan: {
        WANMode: "demo_wanmode",
        WANModeList: ["Ethernet_DHCP", "demo_wanmode"]
      },
      WiFi: {
        CommonSSIDEnable: 1,
        MLOEnable: 0,
        MeshEnable: 0,
        MFPConfig: 0,
        PSC6g: 0,
        wificommon: {
          Enable: 1,
          SSID: "prplOS_prplmesh",
          SecurityMode: "WPA3-Personal",
          SecurityModeAvailable: "WPA3-Personal,WPA2-Personal",
          Password: "password"
        },
        wifi2g: {
          Enable: 1,
          SSID: "prplOS_2g",
          SecurityMode: "WPA3-Personal",
          SecurityModeAvailable: "WPA3-Personal,WPA2-Personal",
          Password: "password"
        },
        wifi5g: {
          Enable: 1,
          SSID: "prplOS_5g",
          SecurityMode: "WPA3-Personal",
          SecurityModeAvailable: "WPA3-Personal,WPA2-Personal",
          Password: "password"
        },
        wifi6g: {
          Enable: 0,
          SSID: "",
          SecurityMode: "WPA3-Personal",
          SecurityModeAvailable: "WPA3-Personal,WPA2-Personal",
          Password: ""
        }
      }
    }
  },
  opmode_init: {
    WizardRouter: {
      ModelName: "WREQ-130BE-PRPL",
      OpMode: "Init",  // 👈 Init - 導向 wizard
      Wan: {
        WANMode: "demo_wanmode",
        WANModeList: ["Ethernet_DHCP", "demo_wanmode"]
      },
      WiFi: {
        CommonSSIDEnable: 1,
        MLOEnable: 0,
        MeshEnable: 0,
        MFPConfig: 0,
        PSC6g: 0,
        wificommon: {
          Enable: 1,
          SSID: "",
          SecurityMode: "WPA3-Personal",
          SecurityModeAvailable: "WPA3-Personal,WPA2-Personal",
          Password: ""
        },
        wifi2g: {
          Enable: 1,
          SSID: "",
          SecurityMode: "WPA3-Personal",
          SecurityModeAvailable: "WPA3-Personal,WPA2-Personal",
          Password: ""
        },
        wifi5g: {
          Enable: 1,
          SSID: "",
          SecurityMode: "WPA3-Personal",
          SecurityModeAvailable: "WPA3-Personal,WPA2-Personal",
          Password: ""
        },
        wifi6g: {
          Enable: 0,
          SSID: "",
          SecurityMode: "WPA3-Personal",
          SecurityModeAvailable: "WPA3-Personal,WPA2-Personal",
          Password: ""
        }
      }
    }
  },
  opmode_normal: {
    WizardRouter: {
      ModelName: "WREQ-130BE-PRPL",
      OpMode: "Gateway",  // 👈 Gateway/Normal - 導向 dashboard
      Wan: {
        WANMode: "demo_wanmode",
        WANModeList: ["Cellular", "Ethernet_DHCP", "GPON_DHCP", "demo_wanmode"]
      },
      WiFi: {
        CommonSSIDEnable: 1,
        MLOEnable: 1,
        MeshEnable: 1,
        MFPConfig: 1,
        PSC6g: 1,
        wificommon: {
          Enable: 1,
          SSID: "prplOS_prplmesh",
          SecurityMode: "WPA3-Personal",
          SecurityModeAvailable: "WPA3-Personal,WPA2-Personal",
          Password: "password"
        },
        wifi2g: {
          Enable: 1,
          SSID: "prplOS_2g",
          SecurityMode: "WPA3-Personal",
          SecurityModeAvailable: "WPA3-Personal,WPA2-Personal",
          Password: "password"
        },
        wifi5g: {
          Enable: 1,
          SSID: "prplOS_5g",
          SecurityMode: "WPA3-Personal",
          SecurityModeAvailable: "WPA3-Personal,WPA2-Personal",
          Password: "password"
        },
        wifi6g: {
          Enable: 1,
          SSID: "prplOS_6g",
          SecurityMode: "WPA3-Personal",
          SecurityModeAvailable: "WPA3-Personal,WPA2-Personal",
          Password: "password"
        }
      }
    }
  },
  opmode_missing: {
    WizardRouter: {
      ModelName: "WREQ-130BE-PRPL",
      OpMode: undefined as any,  // 👈 完全不包含 OpMode - 應該重試
      Wan: {
        WANMode: "demo_wanmode",
        WANModeList: ["Ethernet_DHCP", "demo_wanmode"]
      },
      WiFi: {
        CommonSSIDEnable: 1,
        MLOEnable: 0,
        MeshEnable: 0,
        MFPConfig: 0,
        PSC6g: 0,
        wificommon: {
          Enable: 1,
          SSID: "prplOS_prplmesh",
          SecurityMode: "WPA3-Personal",
          SecurityModeAvailable: "WPA3-Personal,WPA2-Personal",
          Password: "password"
        },
        wifi2g: {
          Enable: 1,
          SSID: "prplOS_2g",
          SecurityMode: "WPA3-Personal",
          SecurityModeAvailable: "WPA3-Personal,WPA2-Personal",
          Password: "password"
        },
        wifi5g: {
          Enable: 1,
          SSID: "prplOS_5g",
          SecurityMode: "WPA3-Personal",
          SecurityModeAvailable: "WPA3-Personal,WPA2-Personal",
          Password: "password"
        },
        wifi6g: {
          Enable: 0,
          SSID: "",
          SecurityMode: "WPA3-Personal",
          SecurityModeAvailable: "WPA3-Personal,WPA2-Personal",
          Password: ""
        }
      }
    }
  }
};

export const wizardMockData = wizardScenarios[TEST_SCENARIO];

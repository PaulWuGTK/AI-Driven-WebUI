import type { LoginResponse } from '../../types/auth';

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

export const wizardMockData = {
  WizardRouter: {
    ModelName: "WREQ-130BE-PRPL",
    OpMode: "Gateway",
    Wan: {
      WANMode: "demo_wanmode",
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
        SecurityModeAvailable: "WPA3-Personal,WPA2-WPA3-Personal",
        Password: "password"
      },
      wifi2g: {
        Enable: 1,
        SSID: "prplOS_prplmesh",
        SecurityMode: "WPA2-WPA3-Personal",
        SecurityModeAvailable: "None,WPA2-Personal,WPA3-Personal,WPA2-WPA3-Personal",
        Password: "password"
      },
      wifi5g: {
        Enable: 1,
        SSID: "prplOS_prplmesh",
        SecurityMode: "WPA2-WPA3-Personal",
        SecurityModeAvailable: "None,WPA2-Personal,WPA3-Personal,WPA2-WPA3-Personal",
        Password: "password"
      },
      wifi6g: {
        Enable: 1,
        SSID: "prplOS_prplmesh",
        SecurityMode: "WPA3-Personal",
        SecurityModeAvailable: "WPA3-Personal",
        Password: "password"
      }
    }
  }
};
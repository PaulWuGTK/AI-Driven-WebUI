import { AuthService } from '../auth';

const isDevelopment = import.meta.env.DEV;

export interface SidebarMenuLanguage {
  available: string[];
  current: string;
}

export interface SidebarMenuApp {
  state: string;
  alias: string;
  name: string;
  duid: string;
}

export interface SidebarMenuResponse {
  SidebarMenu: {
    Apps: SidebarMenuApp[];
    mode: 'Gateway' | 'Extender';
    language: SidebarMenuLanguage;
  }
}

export interface SidebarMenuUpdateRequest {
  SidebarMenu: {
    language: {
      current: string;
    }
  }
}

export const getSidebarMenu = async (): Promise<SidebarMenuResponse> => {
  if (isDevelopment) {
    return {
      SidebarMenu: {
        Apps: [
          {
            state: "active",
            alias: "cpe-917362a3-86e8-5332-bcfd-a4223f0e65e6",
            name: "arm32v7/streambow",
            duid: "00000000-0000-5000-b000-000000000001"
          }
        ],
        mode: "Gateway",
        language: {
          available: ["en", "fr", "ja", "de", "zh-TW", "zh-CN", "ko"],
          current: "en"
        }
      }
    };
  }

  const auth = AuthService.getInstance();
  const sessionId = auth.getSessionId();
  
  const response = await fetch('/API/info?list=SidebarMenu', {
    headers: {
      ...(sessionId ? { 'Authorization': `bearer ${sessionId}` } : {})
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sidebar menu: ${response.status}`);
  }

  return response.json();
};

export const updateSidebarMenuLanguage = async (language: string): Promise<SidebarMenuResponse> => {
  if (isDevelopment) {
    return {
      SidebarMenu: {
        Apps: [
          {
            state: "active",
            alias: "cpe-917362a3-86e8-5332-bcfd-a4223f0e65e6",
            name: "arm32v7/streambow",
            duid: "00000000-0000-5000-b000-000000000001"
          }
        ],
        mode: "Gateway",
        language: {
          available: ["en", "fr", "ja", "de", "zh-TW", "zh-CN", "ko"],
          current: language
        }
      }
    };
  }

  const auth = AuthService.getInstance();
  const sessionId = auth.getSessionId();
  
  const response = await fetch('/API/info?list=SidebarMenu', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionId ? { 'Authorization': `bearer ${sessionId}` } : {})
    },
    body: JSON.stringify({
      SidebarMenu: {
        language: {
          current: language
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to update sidebar menu language: ${response.status}`);
  }

  return response.json();
};
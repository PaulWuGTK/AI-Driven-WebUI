import { AuthService } from '../auth';
import { useRouter } from 'vue-router';

const isDevelopment = import.meta.env.DEV;
const SIDEBAR_MENU_CACHE_TTL_MS = 800;

let sidebarMenuInFlight: Promise<SidebarMenuResponse> | null = null;
let sidebarMenuCache: {
  sessionId: string;
  data: SidebarMenuResponse;
  ts: number;
} | null = null;

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

export type UserRole = 'super' | 'normal';

export interface SidebarMenuResponse {
  SidebarMenu: {
    Apps: SidebarMenuApp[];
    mode: 'Gateway' | 'Extender' | 'Bridge' | 'Init';
    NetLayoutType: 'prpl' | 'genix' | 'cht';
    user: UserRole;
    language: SidebarMenuLanguage;
    features: Record<string, boolean>;
  }
}

export interface SidebarMenuUpdateRequest {
  SidebarMenu: {
    language: {
      current: string;
    }
  }
}

const normalizeNetLayoutType = (value: unknown): SidebarMenuResponse['SidebarMenu']['NetLayoutType'] => {
  return value === 'prpl' || value === 'genix' || value === 'cht' ? value : 'prpl';
};

const normalizeUserRole = (value: unknown): UserRole => {
  if (typeof value !== 'string') return 'normal';

  const normalized = value.trim().toLowerCase().replace(/[\s_-]+/g, '');
  const superRoles = new Set(['super', 'superuser', 'admin', 'administrator', 'root']);
  const normalRoles = new Set(['normal', 'normaluser', 'user']);

  if (superRoles.has(normalized)) return 'super';
  if (normalRoles.has(normalized)) return 'normal';

  if (isDevelopment && normalized.length > 0) {
    console.warn(`[SidebarMenu] Unknown user role "${value}", fallback to "normal"`);
  }

  return 'normal';
};

const normalizeSidebarMenuResponse = (payload: SidebarMenuResponse): SidebarMenuResponse => ({
  ...payload,
  SidebarMenu: {
    ...payload.SidebarMenu,
    NetLayoutType: normalizeNetLayoutType(payload.SidebarMenu?.NetLayoutType),
    user: normalizeUserRole(payload.SidebarMenu?.user),
  }
});

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
        NetLayoutType: "cht",
        user: "super",
        language: {
          available: ["en", "fr", "ja", "de", "zh-TW", "zh-CN", "ko"],
          current: "en"
        },
        features: {
          thread: true,
          matter: false,
          cellular: false
        }
      }
    };
  }

  const auth = AuthService.getInstance();
  const sessionId = auth.getSessionId();
  const username = localStorage.getItem('username')?.trim();

  if (!sessionId) {
    throw new Error('Missing session token for SidebarMenu request');
  }

  const now = Date.now();
  if (
    sidebarMenuCache &&
    sidebarMenuCache.sessionId === sessionId &&
    now - sidebarMenuCache.ts <= SIDEBAR_MENU_CACHE_TTL_MS
  ) {
    return sidebarMenuCache.data;
  }

  if (sidebarMenuInFlight) {
    return sidebarMenuInFlight;
  }
  
  sidebarMenuInFlight = (async () => {
    const response = await fetch('/API/info?list=SidebarMenu', {
      headers: {
        'Authorization': `bearer ${sessionId}`,
        ...(username ? { 'X-Auth-Username': username } : {})
      }
    });

    if (response.status === 401 || response.status === 403) {
      // Authentication error - redirect to login
      auth.clearSession();
      window.location.href = `/login?t=${Date.now()}`;
      throw new Error(`Failed to fetch sidebar menu: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch sidebar menu: ${response.status}`);
    }

    const payload = await response.json();
    const normalized = normalizeSidebarMenuResponse(payload);
    sidebarMenuCache = {
      sessionId,
      data: normalized,
      ts: Date.now()
    };
    return normalized;
  })();

  try {
    return await sidebarMenuInFlight;
  } catch (err) {
    console.error('Error fetching sidebar menu:', err);
    
    // Check if error message contains 403 or 401
    if (err instanceof Error && 
        (err.message.includes('403') || 
         err.message.includes('401') ||
         err.message.includes('Failed to fetch sidebar menu'))) {
      // Clear session and redirect to login
      auth.clearSession();
      
      window.location.href = `/login?t=${Date.now()}`;
    }
    
    throw err;
  } finally {
    sidebarMenuInFlight = null;
  }
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
        NetLayoutType: "prpl",
        user: "super",
        language: {
          available: ["en", "fr", "ja", "de", "zh-TW", "zh-CN", "ko"],
          current: language
        },
        features: {
          thread: true,
          matter: false,
          cellular: false
        }
      }
    };
  }

  const auth = AuthService.getInstance();
  const sessionId = auth.getSessionId();
  const username = localStorage.getItem('username')?.trim();

  if (!sessionId) {
    throw new Error('Missing session token for SidebarMenu update request');
  }
  
  try {
    const response = await fetch('/API/info?list=SidebarMenu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${sessionId}`,
        ...(username ? { 'X-Auth-Username': username } : {})
      },
      body: JSON.stringify({
        SidebarMenu: {
          language: {
            current: language
          }
        }
      })
    });

    if (response.status === 401 || response.status === 403) {
      // Authentication error - redirect to login
      auth.clearSession();
      window.location.href = `/login?t=${Date.now()}`;
      throw new Error(`Failed to update sidebar menu language: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(`Failed to update sidebar menu language: ${response.status}`);
    }

    const payload = await response.json();
    const normalized = normalizeSidebarMenuResponse(payload);
    sidebarMenuCache = {
      sessionId,
      data: normalized,
      ts: Date.now()
    };
    return normalized;
  } catch (err) {
    console.error('Error updating sidebar menu language:', err);
    
    // Check if error message contains 403 or 401
    if (err instanceof Error && 
        (err.message.includes('403') || 
         err.message.includes('401'))) {
      // Clear session and redirect to login
      auth.clearSession();
      window.location.href = `/login?t=${Date.now()}`;
    }
    
    throw err;
  }
};

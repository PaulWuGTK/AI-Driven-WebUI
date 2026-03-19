import { ref } from 'vue';
import { getSidebarMenu } from '../services/api/sidebarMenu';
import { AuthService } from '../services/auth';
import { isMenuVisible, type NetLayoutType, type OperationMode, type UserRole } from '../types/menuVisibility';

export function useMenuVisibilityContext(defaultRole: UserRole = 'super') {
  const isDevelopment = import.meta.env.DEV;
  const operationMode = ref<OperationMode>('Gateway');
  const netLayoutType = ref<NetLayoutType>('prpl');
  const userRole = ref<UserRole>(defaultRole);
  const features = ref<Record<string, boolean>>({});

  const fetchMenuContext = async () => {
    const auth = AuthService.getInstance();
    if (!auth.isAuthenticated() && !isDevelopment) {
      return;
    }

    try {
      const response = await getSidebarMenu();
      const modeMapping: Record<string, OperationMode> = {
        Init: 'Init',
        Gateway: 'Gateway',
        Bridge: 'Bridge',
        Extender: 'Extender'
      };

      operationMode.value = modeMapping[response.SidebarMenu.mode] || 'Gateway';
      netLayoutType.value = response.SidebarMenu.NetLayoutType || 'prpl';
      userRole.value = response.SidebarMenu.user || defaultRole;
      features.value = response.SidebarMenu.features || {};
    } catch (error) {
      console.warn('fetchMenuContext failed, fallback to defaults', error);
    }
  };

  const canShowMenu = (menuKey: string): boolean => {
    return isMenuVisible(
      menuKey,
      netLayoutType.value,
      operationMode.value,
      features.value,
      userRole.value
    );
  };

  return {
    operationMode,
    netLayoutType,
    userRole,
    features,
    fetchMenuContext,
    canShowMenu
  };
}

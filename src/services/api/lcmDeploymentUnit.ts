import type {
  LcmDeploymentUnitResponse,
  LcmDeploymentUnitRequest
} from '../../types/lcmDeploymentUnit';
import { handleApiResponse } from '../../utils/apiUtils';
import { callApi } from '../apiClient';

const isDevelopment = import.meta.env.DEV;

const mockData: LcmDeploymentUnitResponse = {
  AdvancedLcmDeploymentUnit: {
    DUList: [
      {
        Name: 'monitor',
        UUID: '00000000-0000-5000-b000-000000000001',
        DUID: 'e61c304b-b5e4-5fdb-9836-60001e90a125',
        Version: '1.0.0',
        Status: 'Installed',
        Description: 'Real-time System Monitor FastCGI App.',
        InstalledEE: 'generic',
        URL: 'docker://10.5.163.2:5000/arm64v8/sys-monitor:1.0.0',
        Privileged: true,
        NetworkConfig: {
          ShareParentNetwork: false,
          AccessInterfaces: [],
          PortForwarding: [
            {
              Protocol: 'Both',
              ExternalPort: 8000,
              Interface: 'Lan',
              InternalPort: 8000
            }
          ]
        },
        HostObject: [],
        AutoRestart: {
          Enable: true,
          MaxRetryCount: 10
        }
      },
      {
        Name: 'netdata',
        UUID: '00000000-0000-5000-b000-000000000002',
        DUID: 'e61c304b-b5e4-5fdb-9836-60001e90a127',
        Version: '1.0.0',
        Status: 'Installed',
        Description: 'Real-time System Monitor FastCGI App.',
        InstalledEE: 'generic',
        URL: 'docker://10.5.163.2:5000/arm64v8/lcm-netdata:1.22.1',
        Privileged: true,
        NetworkConfig: {
          ShareParentNetwork: true,
          AccessInterfaces: [],
          PortForwarding: []
        },
        HostObject: [],
        AutoRestart: {
          Enable: false,
          MaxRetryCount: 10
        }
      }
    ],
    ExecEnvList: [{ Name: 'generic' }, { Name: 'test-1' }],
    InterfaceList: ['Wan', 'Lan'],
    ProtocolList: ['TCP', 'UDP', 'Both'],
    HostObjectMountType: ['mount', 'mount,bind', 'mount,bind,create=file']
  }
};

export const getLcmDeploymentUnitConfig = async (): Promise<LcmDeploymentUnitResponse> => {
  if (isDevelopment) {
    return mockData;
  }
  return callApi<LcmDeploymentUnitResponse>('/API/info?list=AdvancedLcmDeploymentUnit');
};

export const updateLcmDeploymentUnit = async (
  data: LcmDeploymentUnitRequest
): Promise<LcmDeploymentUnitResponse> => {
  if (isDevelopment) {
    console.log('Update LCM DeploymentUnit:', data);
    const action = data.AdvancedLcmDeploymentUnit.Action;

    if (action === 'Install' && 'UUID' in data.AdvancedLcmDeploymentUnit) {
      const installData = data.AdvancedLcmDeploymentUnit;
      mockData.AdvancedLcmDeploymentUnit.DUList.push({
        Name: 'new-du-' + Date.now(),
        UUID: installData.UUID,
        DUID: 'new-duid-' + Date.now(),
        Version: '1.0.0',
        Status: 'Installing',
        Description: 'New Deployment Unit',
        InstalledEE: installData.InstalledEE,
        URL: installData.URL,
        Privileged: installData.Privileged,
        NetworkConfig: installData.NetworkConfig,
        HostObject: installData.HostObject,
        AutoRestart: installData.AutoRestart
      });
    } else if (action === 'Update' && 'DUID' in data.AdvancedLcmDeploymentUnit) {
      const updateData = data.AdvancedLcmDeploymentUnit;
      const index = mockData.AdvancedLcmDeploymentUnit.DUList.findIndex(
        (item) => item.DUID === updateData.DUID
      );
      if (index !== -1) {
        mockData.AdvancedLcmDeploymentUnit.DUList[index] = {
          ...mockData.AdvancedLcmDeploymentUnit.DUList[index],
          URL: updateData.URL,
          InstalledEE: updateData.InstalledEE,
          Privileged: updateData.Privileged,
          NetworkConfig: updateData.NetworkConfig,
          HostObject: updateData.HostObject,
          AutoRestart: updateData.AutoRestart
        };
      }
    } else if (action === 'Uninstall' && 'DUID' in data.AdvancedLcmDeploymentUnit) {
      const uninstallData = data.AdvancedLcmDeploymentUnit;
      mockData.AdvancedLcmDeploymentUnit.DUList =
        mockData.AdvancedLcmDeploymentUnit.DUList.filter(
          (item) => item.DUID !== uninstallData.DUID
        );
    }

    return mockData;
  }

  const response = await fetch('/API/info?list=AdvancedLcmDeploymentUnit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  return handleApiResponse<LcmDeploymentUnitResponse>(response);
};

import { isOpenWrtWifiLogoMode } from '../../config/runtimeMode';
import type {
  LcmDeploymentUnitResponse,
  LcmDeploymentUnitRequest,
  LcmDeploymentUnitInstallRequest,
  LcmDeploymentUnitUpdateRequest,
  LcmDeploymentUnitUninstallRequest
} from '../../types/lcmDeploymentUnit';
import { callApi } from '../apiClient';
import { toFlag01 } from '../flag01';
import {
  getLcmDeploymentUnitMockData,
  updateLcmDeploymentUnitMockData
} from '../mockData/lcmDeploymentUnitMockData';

const isDevelopment = import.meta.env.DEV || isOpenWrtWifiLogoMode;
const LCM_DU_ENDPOINT = '/API/info?list=AdvancedLcmDeploymentUnit';

const normalizeResponse = (response: LcmDeploymentUnitResponse): LcmDeploymentUnitResponse => ({
  AdvancedLcmDeploymentUnit: {
    ...response.AdvancedLcmDeploymentUnit,
    DUList: response.AdvancedLcmDeploymentUnit.DUList.map((item) => ({
      ...item,
      Privileged: toFlag01(item.Privileged, 0, {
        endpoint: LCM_DU_ENDPOINT,
        path: `AdvancedLcmDeploymentUnit.DUList[${item.DUID || item.UUID || 'unknown'}].Privileged`
      }),
      NetworkConfig: {
        ...item.NetworkConfig,
        ShareParentNetwork: toFlag01(item.NetworkConfig?.ShareParentNetwork, 0, {
          endpoint: LCM_DU_ENDPOINT,
          path: `AdvancedLcmDeploymentUnit.DUList[${item.DUID || item.UUID || 'unknown'}].NetworkConfig.ShareParentNetwork`
        })
      },
      AutoRestart: {
        ...item.AutoRestart,
        Enable: toFlag01(item.AutoRestart?.Enable, 0, {
          endpoint: LCM_DU_ENDPOINT,
          path: `AdvancedLcmDeploymentUnit.DUList[${item.DUID || item.UUID || 'unknown'}].AutoRestart.Enable`
        })
      }
    }))
  }
});

const normalizeRequest = (data: LcmDeploymentUnitRequest): LcmDeploymentUnitRequest => {
  const payload = data.AdvancedLcmDeploymentUnit;
  if (payload.Action === 'Uninstall') {
    return {
      AdvancedLcmDeploymentUnit: payload
    } satisfies LcmDeploymentUnitUninstallRequest;
  }

  if (payload.Action === 'Install') {
    return {
      AdvancedLcmDeploymentUnit: {
        ...payload,
        Privileged: toFlag01(payload.Privileged, 0, {
          endpoint: LCM_DU_ENDPOINT,
          path: 'AdvancedLcmDeploymentUnit.Privileged',
          reportBoolean: false
        }),
        NetworkConfig: {
          ...payload.NetworkConfig,
          ShareParentNetwork: toFlag01(payload.NetworkConfig?.ShareParentNetwork, 0, {
            endpoint: LCM_DU_ENDPOINT,
            path: 'AdvancedLcmDeploymentUnit.NetworkConfig.ShareParentNetwork',
            reportBoolean: false
          })
        },
        AutoRestart: {
          ...payload.AutoRestart,
          Enable: toFlag01(payload.AutoRestart?.Enable, 0, {
            endpoint: LCM_DU_ENDPOINT,
            path: 'AdvancedLcmDeploymentUnit.AutoRestart.Enable',
            reportBoolean: false
          })
        }
      }
    } satisfies LcmDeploymentUnitInstallRequest;
  }

  return {
    AdvancedLcmDeploymentUnit: {
      ...payload,
      Privileged: toFlag01(payload.Privileged, 0, {
        endpoint: LCM_DU_ENDPOINT,
        path: 'AdvancedLcmDeploymentUnit.Privileged',
        reportBoolean: false
      }),
      NetworkConfig: {
        ...payload.NetworkConfig,
        ShareParentNetwork: toFlag01(payload.NetworkConfig?.ShareParentNetwork, 0, {
          endpoint: LCM_DU_ENDPOINT,
          path: 'AdvancedLcmDeploymentUnit.NetworkConfig.ShareParentNetwork',
          reportBoolean: false
        })
      },
      AutoRestart: {
        ...payload.AutoRestart,
        Enable: toFlag01(payload.AutoRestart?.Enable, 0, {
          endpoint: LCM_DU_ENDPOINT,
          path: 'AdvancedLcmDeploymentUnit.AutoRestart.Enable',
          reportBoolean: false
        })
      }
    }
  } satisfies LcmDeploymentUnitUpdateRequest;
};

export const getLcmDeploymentUnitConfig = async (): Promise<LcmDeploymentUnitResponse> => {
  if (isDevelopment) {
    return normalizeResponse(getLcmDeploymentUnitMockData());
  }
  const response = await callApi<LcmDeploymentUnitResponse>(LCM_DU_ENDPOINT);
  return normalizeResponse(response);
};

export const updateLcmDeploymentUnit = async (
  data: LcmDeploymentUnitRequest
): Promise<LcmDeploymentUnitResponse> => {
  const normalizedData = normalizeRequest(data);

  if (isDevelopment) {
    console.log('Update LCM DeploymentUnit:', normalizedData);
    return normalizeResponse(updateLcmDeploymentUnitMockData(normalizedData));
  }

  return callApi<LcmDeploymentUnitResponse>(LCM_DU_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(normalizedData)
  });
};

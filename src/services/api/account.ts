import type { ManagementAccountResponse, ManagementAccountUpdateRequest, ManagementAccountUpdateResponse } from '../../types/account';
import { callApi } from '../apiClient';

const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = '/API';

export async function getAccountSettings(): Promise<ManagementAccountResponse> {
  if (isDevelopment) {
    return {
      ManagementAccount: {
        Username: 'admin',
        MaxLength: 15,
        NoSpace: true,
        DMWritable: true,
        DMReadable: false
      }
    };
  }
  return callApi<ManagementAccountResponse>(`${API_BASE_URL}/info?list=ManagementAccount`);
}

export async function updateAccountPassword(data: ManagementAccountUpdateRequest): Promise<ManagementAccountUpdateResponse> {
  if (isDevelopment) {
    if (data.ManagementAccount.OldPassword === 'admin') {
      return {
        ManagementAccount: {
          result: 'Success',
          reason: ''
        }
      };
    } else {
      return {
        ManagementAccount: {
          result: 'Fail',
          reason: 'Old Password confirm fail'
        }
      };
    }
  }

  return callApi<ManagementAccountUpdateResponse>(`${API_BASE_URL}/info?list=ManagementAccount`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

import { callApi } from '../apiClient';
import type {
  ManagementAccountChtResponse,
  ManagementAccountChtUpdateRequest,
  ManagementAccountChtUpdateResponse
} from '../../types/accountCht';

const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = '/API';

export async function getAccountChtSettings(): Promise<ManagementAccountChtResponse> {
  if (isDevelopment) {
    return {
      ManagementAccountCht: {
        CurrentUser: {
          UserPath: 'Users.User.1.',
          Username: 'admin',
          UserType: 'super',
          RoleAlias: 'WebAdmin'
        },
        Users: [
          {
            UserPath: 'Users.User.1.',
            Username: 'admin',
            Enable: true,
            StaticUser: true,
            UserType: 'super',
            RoleAlias: 'WebAdmin',
            Editable: true,
            Deletable: false
          },
          {
            UserPath: 'Users.User.2.',
            Username: 'user',
            Enable: true,
            StaticUser: false,
            UserType: 'normal',
            RoleAlias: 'WebViewer',
            Editable: true,
            Deletable: true
          }
        ],
        MaxLength: 15,
        NoSpace: true,
        DMWritable: true,
        DMReadable: true
      }
    };
  }

  return callApi<ManagementAccountChtResponse>(`${API_BASE_URL}/info?list=ManagementAccountCht`);
}

export async function updateAccountChtPassword(
  data: ManagementAccountChtUpdateRequest
): Promise<ManagementAccountChtUpdateResponse> {
  if (isDevelopment) {
    return {
      ManagementAccountCht: {
        result: 'Success',
        reason: ''
      }
    };
  }

  return callApi<ManagementAccountChtUpdateResponse>(`${API_BASE_URL}/info?list=ManagementAccountCht`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateAccountCht(
  data: ManagementAccountChtUpdateRequest
): Promise<ManagementAccountChtUpdateResponse> {
  return updateAccountChtPassword(data);
}

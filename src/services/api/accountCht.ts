import { callApi } from '../apiClient';
import { toFlag01 } from '../flag01';
import type {
  ManagementAccountChtResponse,
  ManagementAccountChtUpdateRequest,
  ManagementAccountChtUpdateResponse
} from '../../types/accountCht';

const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = '/API';
const ACCOUNT_CHT_ENDPOINT = `${API_BASE_URL}/info?list=ManagementAccountCht`;

const normalizeResponse = (
  response: ManagementAccountChtResponse
): ManagementAccountChtResponse => ({
  ManagementAccountCht: {
    ...response.ManagementAccountCht,
    Users: response.ManagementAccountCht.Users.map((user) => ({
      ...user,
      Enable: toFlag01(user.Enable, 0, {
        endpoint: ACCOUNT_CHT_ENDPOINT,
        path: `ManagementAccountCht.Users[${user.Username || user.UserPath || 'unknown'}].Enable`
      }),
      StaticUser: toFlag01(user.StaticUser, 0, {
        endpoint: ACCOUNT_CHT_ENDPOINT,
        path: `ManagementAccountCht.Users[${user.Username || user.UserPath || 'unknown'}].StaticUser`,
        reportBoolean: false
      }),
      Editable: toFlag01(user.Editable, 1, {
        endpoint: ACCOUNT_CHT_ENDPOINT,
        path: `ManagementAccountCht.Users[${user.Username || user.UserPath || 'unknown'}].Editable`,
        reportBoolean: false
      }),
      Deletable: toFlag01(user.Deletable, 0, {
        endpoint: ACCOUNT_CHT_ENDPOINT,
        path: `ManagementAccountCht.Users[${user.Username || user.UserPath || 'unknown'}].Deletable`,
        reportBoolean: false
      })
    })),
    NoSpace: toFlag01(response.ManagementAccountCht.NoSpace, 1, {
      endpoint: ACCOUNT_CHT_ENDPOINT,
      path: 'ManagementAccountCht.NoSpace',
      reportBoolean: false
    }),
    DMWritable: toFlag01(response.ManagementAccountCht.DMWritable, 1, {
      endpoint: ACCOUNT_CHT_ENDPOINT,
      path: 'ManagementAccountCht.DMWritable',
      reportBoolean: false
    }),
    DMReadable: toFlag01(response.ManagementAccountCht.DMReadable, 1, {
      endpoint: ACCOUNT_CHT_ENDPOINT,
      path: 'ManagementAccountCht.DMReadable',
      reportBoolean: false
    })
  }
});

const normalizeRequest = (
  data: ManagementAccountChtUpdateRequest
): ManagementAccountChtUpdateRequest => ({
  ManagementAccountCht: {
    ...data.ManagementAccountCht,
    Enable:
      data.ManagementAccountCht.Enable === undefined
        ? undefined
        : toFlag01(data.ManagementAccountCht.Enable, 1, {
            endpoint: ACCOUNT_CHT_ENDPOINT,
            path: 'ManagementAccountCht.Enable',
            reportBoolean: false
          })
  }
});

export async function getAccountChtSettings(): Promise<ManagementAccountChtResponse> {
  if (isDevelopment) {
    return normalizeResponse({
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
            Enable: 1,
            StaticUser: 1,
            UserType: 'super',
            RoleAlias: 'WebAdmin',
            Editable: 1,
            Deletable: 0
          },
          {
            UserPath: 'Users.User.2.',
            Username: 'user',
            Enable: 1,
            StaticUser: 0,
            UserType: 'normal',
            RoleAlias: 'WebViewer',
            Editable: 1,
            Deletable: 1
          }
        ],
        MaxLength: 15,
        NoSpace: 1,
        DMWritable: 1,
        DMReadable: 1
      }
    });
  }

  const response = await callApi<ManagementAccountChtResponse>(ACCOUNT_CHT_ENDPOINT);
  return normalizeResponse(response);
}

export async function updateAccountChtPassword(
  data: ManagementAccountChtUpdateRequest
): Promise<ManagementAccountChtUpdateResponse> {
  const normalizedData = normalizeRequest(data);

  if (isDevelopment) {
    return {
      ManagementAccountCht: {
        result: 'Success',
        reason: ''
      }
    };
  }

  return callApi<ManagementAccountChtUpdateResponse>(ACCOUNT_CHT_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(normalizedData)
  });
}

export async function updateAccountCht(
  data: ManagementAccountChtUpdateRequest
): Promise<ManagementAccountChtUpdateResponse> {
  return updateAccountChtPassword(data);
}

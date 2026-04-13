export type ManagementAccountChtUserType = 'super' | 'normal';

export interface ManagementAccountChtUser {
  UserPath: string;
  Username: string;
  Enable: 0 | 1;
  StaticUser: 0 | 1;
  UserType: ManagementAccountChtUserType;
  RoleAlias: string;
  Editable: 0 | 1;
  Deletable: 0 | 1;
  // User policy fields (from X_GEMTEK-COM_ ODL extension)
  RetryCount?: number;      // 0-5, default 3
  IdleTimeoutMin?: number;  // 1-60, default 10
  LockTimeMin?: number;     // 0-90, default 3
}

export interface ManagementAccountChtCurrentUser {
  UserPath: string;
  Username: string;
  UserType: ManagementAccountChtUserType;
  RoleAlias: string;
}

export interface ManagementAccountCht {
  CurrentUser: ManagementAccountChtCurrentUser;
  Users: ManagementAccountChtUser[];
  MaxLength: number;
  NoSpace: 0 | 1;
  DMWritable: 0 | 1;
  DMReadable: 0 | 1;
}

export interface ManagementAccountChtResponse {
  ManagementAccountCht: ManagementAccountCht;
}

export interface ManagementAccountChtUpdateRequest {
  ManagementAccountCht: {
    Action?: 'SetPassword' | 'AddUser' | 'DeleteUser' | 'SetPolicy';
    TargetUsername?: string;
    Username?: string;
    OldPassword?: string;
    NewPassword?: string;
    UserType?: ManagementAccountChtUserType;
    Enable?: 0 | 1;
    // Policy fields (for SetPolicy action and optional AddUser inline policy setup)
    RetryCount?: number;      // 0-5
    IdleTimeoutMin?: number;  // 1-60
    LockTimeMin?: number;     // 0-90
  };
}

export interface ManagementAccountChtUpdateResponse {
  ManagementAccountCht: {
    result: 'Success' | 'Fail';
    reason: string;
  };
}

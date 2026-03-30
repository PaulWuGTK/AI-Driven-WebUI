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
    Action?: 'SetPassword' | 'AddUser' | 'DeleteUser';
    TargetUsername?: string;
    Username?: string;
    OldPassword?: string;
    NewPassword?: string;
    UserType?: ManagementAccountChtUserType;
    Enable?: 0 | 1;
  };
}

export interface ManagementAccountChtUpdateResponse {
  ManagementAccountCht: {
    result: 'Success' | 'Fail';
    reason: string;
  };
}

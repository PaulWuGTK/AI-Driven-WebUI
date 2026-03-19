export type ManagementAccountChtUserType = 'super' | 'normal';

export interface ManagementAccountChtUser {
  UserPath: string;
  Username: string;
  Enable: boolean;
  StaticUser: boolean;
  UserType: ManagementAccountChtUserType;
  RoleAlias: string;
  Editable: boolean;
  Deletable: boolean;
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
  NoSpace: boolean;
  DMWritable: boolean;
  DMReadable: boolean;
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
    Enable?: boolean;
  };
}

export interface ManagementAccountChtUpdateResponse {
  ManagementAccountCht: {
    result: 'Success' | 'Fail';
    reason: string;
  };
}

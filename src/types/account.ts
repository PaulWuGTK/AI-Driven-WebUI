export interface ManagementAccount {
  Username: string;
  MaxLength: number;
  NoSpace: boolean;
  DMWritable: boolean;
  DMReadable: boolean;
}

export interface ManagementAccountResponse {
  ManagementAccount: ManagementAccount;
}

export interface ManagementAccountUpdateRequest {
  ManagementAccount: {
    OldPassword: string;
    NewPassword: string;
  };
}

export interface ManagementAccountUpdateResponse {
  ManagementAccount: {
    result: 'Success' | 'Fail';
    reason: string;
  };
}

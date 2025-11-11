export interface InterfaceOption {
  value: string;
  label: string;
}

export interface ApplicationUpnp {
  Enable: boolean;
  InterfaceOptions?: InterfaceOption[];
  Interface: string;
}

export interface UpnpResponse {
  ApplicationUpnp: ApplicationUpnp;
}

export interface UpnpUpdateRequest {
  ApplicationUpnp: {
    Enable: boolean;
    Interface: string;
  };
}

export interface UpnpUpdateResponse {
  ApplicationUpnp: {
    status: 'success' | 'invalid_payload';
  };
}

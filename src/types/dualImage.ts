export interface DualImageStatus {
  boot_partition: string;
  p1_version: string;
  p2_version: string;
}

export interface DualImageResponse {
  StatusDualImage: DualImageStatus;
}

export interface QRScannerResponse {
   MatterProxy: {
     result: string;
     message?: string;
   };
 }

export interface MatterPairingResponse {
  MatterPairing: {
    WiFiEnable: boolean;
    WiFiSSID: string;
    WiFiPassword: string;
  };
}
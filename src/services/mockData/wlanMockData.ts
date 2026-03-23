import type { WlanStatusResponse } from '../../types/wlan';

export const wlanMockData: WlanStatusResponse = {
  "StatusWlan": [
    {
      "Enable": 1,
      "Band": "2.4GHz",
      "Channel": 1,
      "AutoChannel": 0,
      "Bandwidth": "20MHz",
      "MACAddress": "DE:E1:CC:83:C8:F7",
      "Interface": [
        {
          "Alias": "guest",
          "Password": "passwordGuest",
          "Authentication": "WPA2-Personal",
          "Encryption": "AES",
          "BSSID": "76:e2:f9:a5:5e:80",
          "Enable": 0,
          "SSID": "prplOS-guest",
          "Name": "wlan0.1"
        },
        {
          "Alias": "main",
          "Password": "password",
          "Authentication": "WPA2-Personal",
          "Encryption": "AES",
          "BSSID": "76:e2:f9:a5:5d:7f",
          "Enable": 0,
          "SSID": "prplOS",
          "Name": "wlan0"
        }
      ],
      "AssociatedDevice": [
        {
          "MACAddress": "F8:5E:A0:06:B0:FD",
          "BSSID": "76:e2:f9:a5:5d:7f",
          "ConnectionDuration": 405,
          "SignalStrength": -25,
          "LastDataDownlinkRate": 122500,
          "LastDataUplinkRate": 1020800
        },
        {
          "MACAddress": "BC:97:E1:22:11:AA",
          "BSSID": "76:e2:f9:a5:5e:80",
          "ConnectionDuration": 84,
          "SignalStrength": -52,
          "LastDataDownlinkRate": 65000,
          "LastDataUplinkRate": 144400
        }
      ]
    },
    {
      "Enable": 1,
      "Band": "5GHz",
      "Channel": 36,
      "AutoChannel": 0,
      "Bandwidth": "80MHz",
      "MACAddress": "DE:E1:CC:83:C8:F8",
      "Interface": [
        {
          "Alias": "guest",
          "Password": "passwordGuest",
          "Authentication": "WPA2-Personal",
          "Encryption": "AES",
          "BSSID": "76:e2:f9:a5:5e:80",
          "Enable": 0,
          "SSID": "prplOS-guest",
          "Name": "wlan1.2"
        },
        {
          "Alias": "main",
          "Password": "password",
          "Authentication": "WPA2-Personal",
          "Encryption": "AES",
          "BSSID": "76:e2:f9:a5:5d:7f",
          "Enable": 0,
          "SSID": "prplOS",
          "Name": "wlan1.1"
        }
      ],
      "AssociatedDevice": []
    },
    {
      "Enable": 1,
      "Band": "6GHz",
      "Channel": 33,
      "AutoChannel": 0,
      "Bandwidth": "160MHz",
      "MACAddress": "DE:E1:CC:83:C8:F9",
      "Interface": [
        {
          "Alias": "guest",
          "Password": "passwordGuest",
          "Authentication": "WPA2-Personal",
          "Encryption": "AES",
          "BSSID": "76:e2:f9:a5:5e:80",
          "Enable": 0,
          "SSID": "prplOS-guest",
          "Name": "wlan2.1"
        },
        {
          "Alias": "main",
          "Password": "password",
          "Authentication": "WPA2-Personal",
          "Encryption": "AES",
          "BSSID": "76:e2:f9:a5:5d:7f",
          "Enable": 0,
          "SSID": "prplOS",
          "Name": "wlan2"
        }
      ],
      "AssociatedDevice": [
        {
          "MACAddress": "68:DC:AF:12:34:56",
          "BSSID": "76:e2:f9:a5:5d:7f",
          "ConnectionDuration": 122,
          "SignalStrength": -41,
          "LastDataDownlinkRate": 1200000,
          "LastDataUplinkRate": 980000
        }
      ]
    }
  ]
};

import type { DdnsResponse } from '../../types/ddns';

export const ddnsData: DdnsResponse = {
  "Ddns": {
    "Providers": [
      {
        "Name": "DynDNS",
        "Username": "user1",
        "Password": "********",
        "Domain": "example.dyndns.org",
        "Status": "Connected"
      },
      {
        "Name": "No-IP",
        "Username": "user2", 
        "Password": "********",
        "Domain": "example.no-ip.com",
        "Status": "Disconnected"
      }
    ]
  }
};
# API JSON Reference

以下整理目前前端程式中可確認的 API JSON 結構。  
格式改成每個 API 一個 section，內含 `GET` / `POST Request` / `Response` 範例。  
日期先統一標成 `03/04/2026`。

## ApplicationUpnp
<details><summary>JSON Data (date : 03/04/2026)</summary><div>

GET :
```json
{
  "ApplicationUpnp": {
    "Enable": true,
    "InterfaceOptions": [
      {
        "value": "Device.Logical.Interface.1.",
        "label": "wan"
      },
      {
        "value": "Device.Logical.Interface.3.",
        "label": "guest"
      }
    ],
    "Interface": "Device.Logical.Interface.1.",
    "PortMappings": [
      {
        "Path": "Device.NAT.PortMapping.1.",
        "Description": "UPnP-Test",
        "ExternalPort": 18080,
        "Id": 1,
        "Origin": "UPnP",
        "InternalPort": 8080,
        "RemainingLeaseTime": 604199,
        "LeaseDuration": 604800,
        "RemoteHost": "",
        "Enable": true,
        "Interface": "Device.Logical.Interface.1",
        "Status": "Enabled",
        "InternalClient": "192.168.101.168",
        "Protocol": "TCP",
        "ExternalPortEnd": 0
      }
    ],
    "PortMappingStats": {
      "total": 1
    }
  }
}
```

POST Request :
```json
{
  "ApplicationUpnp": {
    "Enable": true,
    "Interface": "Device.Logical.Interface.1."
  }
}
```

POST Response :
```json
{
  "ApplicationUpnp": {
    "status": "success"
  }
}
```
</div></details>

## AppXperienceControl
<details><summary>JSON Data (date : 03/04/2026)</summary><div>

POST Request :
```json
{
  "AppXperienceControl": ""
}
```

POST Response :
```json
{
  "AppXperienceControl": {
    "status_code": 300,
    "data": {
      "download_udp": {
        "throughput": 852
      },
      "upload_udp": {
        "throughput": 341
      },
      "ping": {
        "packet_loss": 0,
        "min_echo_time": 12,
        "mean_echo_time": 18,
        "max_echo_time": 24
      }
    }
  }
}
```
</div></details>

## LoginCaptcha
<details><summary>JSON Data (date : 03/04/2026)</summary><div>

GET :
```json
{
  "LoginCaptcha": {
    "captchaId": "mock-captcha-id-1730680000000",
    "expiresIn": 60,
    "imageBase64": "PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjgwIiB4bWxucz0i..."
  }
}
```

Mock Extra Field :
```json
{
  "LoginCaptcha": {
    "captchaId": "mock-captcha-id-1730680000000",
    "expiresIn": 60,
    "captchaText": "AB12C",
    "imageBase64": "PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjgwIiB4bWxucz0i..."
  }
}
```
</div></details>

## Login
<details><summary>JSON Data (date : 03/04/2026)</summary><div>

POST Request :
```json
{
  "Login": {
    "username": "admin",
    "captchaId": "mock-captcha-id-1730680000000",
    "captcha": "AB12C"
  }
}
```

POST Response :
```json
{
  "Login": {
    "status": "ok"
  }
}
```

POST Response - captcha invalid :
```json
{
  "Login": {
    "status": "captcha_invalid",
    "failCount": 1,
    "error": "Invalid captcha"
  }
}
```

POST Response - locked :
```json
{
  "Login": {
    "status": "locked",
    "locked": true,
    "retryAfter": 300,
    "lockUntil": 1730680300,
    "error": "Account locked"
  }
}
```

Session Response (`POST /session`) :
```json
{
  "absoluteTimeout": 3600,
  "loginAttempts": 0,
  "idleTimeout": 600,
  "sessionID": "dfcyPRISVuLeKSiNSGeJyotChGxdIeSpM9fkHOWmqbfv7gUvKCAFqSufdcirgJwF"
}
```
</div></details>

## ManagementAccount
<details><summary>JSON Data (date : 03/04/2026)</summary><div>

GET :
```json
{
  "ManagementAccount": {
    "Username": "admin",
    "MaxLength": 15,
    "NoSpace": true,
    "DMWritable": true,
    "DMReadable": false
  }
}
```

POST Request :
```json
{
  "ManagementAccount": {
    "OldPassword": "admin",
    "NewPassword": "new-password"
  }
}
```

POST Response :
```json
{
  "ManagementAccount": {
    "result": "Success",
    "reason": ""
  }
}
```

POST Response - fail :
```json
{
  "ManagementAccount": {
    "result": "Fail",
    "reason": "Old Password confirm fail"
  }
}
```
</div></details>

## ManagementDeviceReset
<details><summary>JSON Data (date : 03/04/2026)</summary><div>

POST Request - Reboot :
```json
{
  "ManagementDeviceReset": {
    "Action": "Reboot",
    "Cause": "UserInitiated",
    "Reason": "Reboot triggered via Web UI"
  }
}
```

POST Request - FactoryReset :
```json
{
  "ManagementDeviceReset": {
    "Action": "FactoryReset",
    "Cause": "UserInitiated",
    "Reason": "Factory Reset triggered via Web UI"
  }
}
```

POST Response :
```json
{
  "ManagementDeviceReset": "OK"
}
```
</div></details>

## SetNSubscribe
<details><summary>JSON Data (date : 03/04/2026)</summary><div>

POST Request - Ping :
```json
{
  "SetNSubscribe": {
    "DM": "Device.IP.Diagnostics.IPPing.",
    "filter": "Device.IP.Diagnostics.IPPing.",
    "Parameters": {
      "DiagnosticsState": "Requested",
      "Interface": "Device.Logical.Interface.1.",
      "ProtocolVersion": "IPv4",
      "NumberOfRepetitions": 4,
      "Host": "8.8.8.8",
      "Timeout": 1000,
      "DataBlockSize": 64
    }
  }
}
```

POST Request - DNS Lookup :
```json
{
  "SetNSubscribe": {
    "DM": "Device.DNS.Diagnostics.NSLookupDiagnostics.",
    "filter": "Device.DNS.Diagnostics.NSLookupDiagnostics.",
    "Parameters": {
      "DiagnosticsState": "Requested",
      "Interface": "Device.Logical.Interface.1.",
      "HostName": "example.com",
      "DNSServer": "8.8.8.8",
      "Timeout": 1000,
      "NumberOfRepetitions": 1
    }
  }
}
```

POST Response :
```json
{
  "SetNSubscribe": "OK"
}
```
</div></details>

## SidebarMenu
<details><summary>JSON Data (date : 03/04/2026)</summary><div>

GET :
```json
{
  "SidebarMenu": {
    "Apps": [
      {
        "state": "active",
        "alias": "cpe-917362a3-86e8-5332-bcfd-a4223f0e65e6",
        "name": "arm32v7/streambow",
        "duid": "00000000-0000-5000-b000-000000000001"
      }
    ],
    "mode": "Gateway",
    "NetLayoutType": "prpl",
    "language": {
      "available": ["en", "fr", "ja", "de", "zh-TW", "zh-CN", "ko"],
      "current": "en"
    },
    "features": {
      "thread": true,
      "matter": false,
      "cellular": false
    }
  }
}
```

POST Request :
```json
{
  "SidebarMenu": {
    "language": {
      "current": "ja"
    }
  }
}
```

POST Response :
```json
{
  "SidebarMenu": {
    "Apps": [
      {
        "state": "active",
        "alias": "cpe-917362a3-86e8-5332-bcfd-a4223f0e65e6",
        "name": "arm32v7/streambow",
        "duid": "00000000-0000-5000-b000-000000000001"
      }
    ],
    "mode": "Gateway",
    "NetLayoutType": "prpl",
    "language": {
      "available": ["en", "fr", "ja", "de", "zh-TW", "zh-CN", "ko"],
      "current": "ja"
    },
    "features": {
      "thread": true,
      "matter": false,
      "cellular": false
    }
  }
}
```

Note :
- 若 `NetLayoutType` 收到 `unknown` 或其他非預期值，前端會 fallback 成 `prpl`
</div></details>

## StatusDualImage
<details><summary>JSON Data (date : 03/04/2026)</summary><div>

GET :
```json
{
  "StatusDualImage": {
    "boot_partition": "1",
    "p1_version": "4.1.0-1.1.5",
    "p2_version": "1.1.4"
  }
}
```
</div></details>

## StatusLcm
<details><summary>JSON Data (date : 03/04/2026)</summary><div>

GET :
```json
{
  "StatusLcm": {
    "ExecutionUnitNumberOfEntries": 1,
    "ExecEnvNumberOfEntries": 1,
    "DeploymentUnitNumberOfEntries": 2,
    "DeploymentUnits": [
      {
        "Name": "arm32v7/lcm-webui-generic",
        "URL": "docker://10.5.163.2:5000/arm32v7/lcm-webui-generic:1.0.2",
        "Status": "Installed",
        "Version": "1.0.2",
        "Vendor": "Gemtek",
        "UUID": "11111111-2222-4333-8444-555555555555",
        "Alias": "cpe-12345678",
        "Resolved": 1
      },
      {
        "Name": "arm32v7/lcm-webui-generic",
        "URL": "docker://10.5.163.2:5000/arm32v7/lcm-webui-generic:1.0.3",
        "Status": "Pending",
        "Version": "1.0.3",
        "Vendor": "Qualcomm",
        "UUID": "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        "Alias": "cpe-abcdef12",
        "Resolved": 0
      }
    ]
  }
}
```
</div></details>

## StatusLog
<details><summary>JSON Data (date : 03/04/2026)</summary><div>

GET :
```json
{
  "StatusLog": {
    "categories": {
      "lcm": {
        "alias": "lcm",
        "pattern": "[^a-zA-Z](lcm|cthulhu|timingila)[^a-zA-Z]"
      },
      "dhcp": {
        "alias": "dhcp",
        "pattern": "(o|tr181-|dnsmasq-)?dhcp"
      }
    },
    "matchCount": 144,
    "source": "/var/log/messages",
    "count": 10,
    "more": true,
    "serverTime": "2025-10-07T10:15:23.000Z",
    "limitDefault": 500,
    "limitMax": 50000,
    "entries": [
      {
        "host": "prplOS",
        "ts": "2025 Oct 7 10:15:23",
        "program": "tr181-dhcpv6client",
        "severity": "Warning",
        "raw": "2025 Oct 7 10:15:23 prplOS tr181-dhcpv6client: ...",
        "message": "nm_popu - [!]Waiting for app:start - (_mod_netmodel_main@mod_netmodel.c:538)",
        "module": "nm_popu"
      }
    ]
  }
}
```

POST Request - Search / Filter :
```json
{
  "StatusLog": {
    "limit": 100,
    "categories": {
      "dhcp": 1,
      "wifi": 1
    },
    "contains": "lease"
  }
}
```

POST Response - Search / Filter :
```json
{
  "StatusLog": {
    "matchCount": 12,
    "source": "/var/log/messages",
    "count": 10,
    "more": true,
    "serverTime": "2025-10-07T10:15:23.000Z",
    "entries": [
      {
        "host": "prplOS",
        "ts": "2025 Oct 7 10:14:18",
        "program": "dnsmasq-dhcp",
        "severity": "Info",
        "raw": "2025 Oct 7 10:14:18 prplOS dnsmasq-dhcp[1234]: DHCPACK(br-lan) ...",
        "message": "DHCPACK(br-lan) 192.168.1.105 aa:bb:cc:dd:ee:ff",
        "module": "dnsmasq-dhcp"
      }
    ]
  }
}
```

POST Request - Export :
```json
{
  "StatusLog": {
    "export": "prepare",
    "categories": {
      "dhcp": 1,
      "wifi": 1
    }
  }
}
```

POST Response - Export :
```json
{
  "StatusLog": {
    "url": "/download/logs-2025-10-07T10-15-23.tgz",
    "filename": "logs-2025-10-07T10-15-23.tgz",
    "size": 123456,
    "matchCount": 0,
    "source": "",
    "count": 0,
    "more": false,
    "serverTime": "2025-10-07T10:15:23.000Z",
    "entries": []
  }
}
```
</div></details>

## UpgradeFw
<details><summary>JSON Data (date : 03/04/2026)</summary><div>

GET :
```json
{
  "UpgradeFw": {
    "UpgradeFw": {
      "1": {
        "Min_Allowed_Ver": "3.0.0.0",
        "BootFailureLog": "",
        "Switch_Status": "Available",
        "FW_UG_Status": "Available",
        "PRPL_Ver": "prplOS4.0",
        "BSP_Ver": "ath13.0",
        "Rollback": 0,
        "Name": "",
        "Available": 1,
        "Version": "1.0.0",
        "GTK_FW_Ver": "3.8.5",
        "Alias": "active",
        "Status": "Active"
      },
      "2": {
        "Min_Allowed_Ver": "3.0.0.0",
        "BootFailureLog": "",
        "Switch_Status": "Downgrade_not_allowed",
        "FW_UG_Status": "Available",
        "PRPL_Ver": "prplOS4.0",
        "BSP_Ver": "ath13.0",
        "Rollback": 0,
        "Name": "",
        "Available": 0,
        "Version": "",
        "GTK_FW_Ver": "2.8.5",
        "Alias": "inactive",
        "Status": "Available"
      }
    }
  }
}
```

POST Request - Activate Bank :
```json
{
  "UpgradeFw": {
    "BankNumber": 2
  }
}
```

POST Request - Firmware Download (`/commands`) :
```json
{
  "command": "Device.DeviceInfo.FirmwareImage.[Alias=='active'].Download()",
  "commandKey": "",
  "sendresp": true,
  "inputArgs": {
    "URL": "file:///tmp/upload/firmware.bin",
    "AutoActivate": true
  }
}
```
</div></details>

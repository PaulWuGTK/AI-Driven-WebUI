# Views Directory Structure

This document describes the reorganized views directory structure for better maintainability and scalability.

## Directory Organization

```
src/views/
├── Dashboard.vue               # Main dashboard
├── Login.vue                   # Login page
├── InProgress.vue              # Placeholder for features in development
│
├── status/                     # Status & Monitoring
│   ├── WanStatus.vue          # WAN status display
│   ├── LanStatus.vue          # LAN status display
│   ├── WlanStatus.vue         # WLAN status display
│   ├── Statistics.vue          # Network statistics
│   ├── MeshInfo.vue           # Mesh network information
│   ├── SystemStats.vue         # System statistics
│   ├── LogStatus.vue           # System logs
│   ├── DualImage.vue           # Dual image status
│   ├── LcmStatus.vue           # LCM status
│   └── WifiNeighbor.vue        # WiFi neighbor information
│
├── network/                    # Network Configuration
│   ├── wan/                    # WAN Configuration
│   │   ├── WanConfig.vue       # Main WAN configuration page
│   │   ├── WanModeManagement.vue
│   │   ├── WanModeDetail.vue
│   │   ├── WanModeEdit.vue
│   │   └── WanModeSetup.vue
│   ├── lan/                    # LAN Configuration
│   │   ├── LanConfig.vue       # Main LAN configuration page
│   │   ├── IPv4Config.vue      # IPv4 settings
│   │   └── DeviceList.vue      # Connected devices
│   └── wireless/               # Wireless Configuration
│       ├── WirelessConfig.vue  # Main wireless page
│       ├── BasicConfig.vue     # Basic wireless settings
│       ├── AdvancedConfig.vue  # Advanced wireless settings
│       ├── MeshConfig.vue      # Mesh network settings
│       ├── WpsConfig.vue       # WPS configuration
│       ├── ExtenderConfig.vue  # Wireless extender
│       ├── GuestNetwork.vue    # Guest network settings
│       ├── MacFiltering.vue    # MAC address filtering
│       ├── advanced/           # Advanced wireless subcomponents
│       ├── basic/              # Basic wireless subcomponents
│       ├── guest/              # Guest network subcomponents
│       ├── macfilter/          # MAC filtering subcomponents
│       └── wps/                # WPS subcomponents
│
├── advanced/                   # Advanced Features
│   ├── nat/                    # NAT Configuration
│   │   ├── NatConfig.vue       # Main NAT configuration
│   │   ├── DmzConfig.vue       # DMZ settings
│   │   └── DmzHostTab.vue      # DMZ host tab
│   ├── DdnsConfig.vue          # Dynamic DNS settings
│   ├── SecurityConfig.vue      # Security settings
│   ├── ServiceControl.vue      # Service control
│   ├── SshConfig.vue           # SSH configuration
│   ├── security/               # Security subcomponents
│   ├── service-control/        # Service control subcomponents
│   └── ssh/                    # SSH subcomponents
│       ├── SshServerManagement.vue
│       ├── SshPublicKeyManagement.vue
│       └── SshCurrentSessions.vue
│
├── application/                # Application Features
│   ├── UpnpConfig.vue          # UPnP settings
│   └── XperienceControl.vue    # Xperience control
│
├── iot/                        # IoT Features
│   ├── thread/                 # Thread protocol
│   │   ├── ThreadLayout.vue
│   │   ├── ThreadCommissioner.vue
│   │   ├── ThreadConfiguration.vue
│   │   ├── ThreadJoin.vue
│   │   ├── ThreadStatus.vue
│   │   └── ThreadTopology.vue
│   └── matter/                 # Matter protocol
│       └── MatterDashboard.vue
│
└── system/                     # System Management
    ├── account/                # Account management
    │   └── AccountManagement.vue
    ├── device/                 # Device management
    │   ├── DeviceManagement.vue
    │   ├── TR069Config.vue
    │   ├── TR369Config.vue
    │   ├── TR369ControllerDetail.vue
    │   └── TR369ControllerEdit.vue
    ├── diagnostics/            # Diagnostic tools
    │   ├── DiagnosticsTools.vue
    │   ├── PingTool.vue
    │   ├── TraceRouteTool.vue
    │   └── DNSLookupTool.vue
    ├── firmware/               # Firmware management
    │   └── FirmwareUpgrade.vue
    ├── backup/                 # Backup & restore
    │   └── BackupManagement.vue
    ├── reset/                  # Factory reset
    │   └── DeviceReset.vue
    ├── reboot/                 # Device reboot
    │   └── DeviceReboot.vue
    ├── ntp/                    # NTP configuration
    │   └── NtpConfig.vue
    └── settings/               # General settings
        ├── SettingsManagement.vue
        └── tabs/
            ├── BackupRestore.vue
            ├── FactoryReset.vue
            └── FirmwareUpdate.vue
```

## Routing Structure

### New Routes (Canonical)

All routes now follow a consistent naming pattern:

```
/status/*           - Status and monitoring pages
/network/*          - Network configuration (WAN, LAN, Wireless)
/advanced/*         - Advanced features (NAT, DDNS, Security, SSH)
/application/*      - Application features (UPnP, Xperience)
/iot/*             - IoT protocols (Thread, Matter)
/system/*          - System management (Account, Device, Diagnostics, etc.)
```

### Legacy Route Redirects

For backward compatibility, all old routes are redirected to new routes:

```
/basic/wan          → /network/wan
/basic/lan          → /network/lan
/basic/wlan         → /network/wireless
/basic/nat          → /advanced/nat
/basic/security     → /advanced/security
/advance/ssh        → /advanced/ssh
/application/ddns   → /advanced/ddns
/management/*       → /system/*
```

## File Naming Conventions

### Pages (Main Views)
- Use descriptive names ending with context
- Examples: `WanConfig.vue`, `LanConfig.vue`, `WirelessConfig.vue`
- Avoid generic names like `Settings.vue`

### Components (Sub-components)
- Use clear, specific names
- Examples: `DeviceList.vue`, `IPv4Config.vue`, `BasicConfig.vue`

### Tabs and Modals
- Include type in name
- Examples: `DmzHostTab.vue`, `ServiceControlModal.vue`

## Import Path Guidelines

### Relative Imports
Always use relative paths for component imports:

```typescript
// From network/wan/WanConfig.vue
import WanModeSetup from './WanModeSetup.vue';        // Same directory
import { useQA } from '../../../utils/qa';            // Utility

// From network/wireless/guest/GuestWiFi.vue
import { GuestConfig } from '../../../../types/guest'; // Type
import BlockingOverlay from '../../../../components/BlockingOverlay.vue'; // Component
```

### Path Depth Reference
- 1 level up: `../`  - Same parent directory
- 2 levels up: `../../` - Grandparent directory
- 3 levels up: `../../../` - From network/* to src/
- 4 levels up: `../../../../` - From network/*/subdir/ to src/

## Migration Guide

### For Developers

When creating or modifying views:

1. **Determine the category**: Is it status, network, advanced, application, iot, or system?
2. **Place in correct directory**: Follow the structure above
3. **Use consistent naming**: Follow naming conventions
4. **Update imports**: Adjust relative paths based on depth
5. **Test routing**: Ensure navigation works correctly

### Finding Files

Old location → New location mapping:

```
views/settings/WanSettings.vue           → views/network/wan/WanConfig.vue
views/settings/lan/LanSettings.vue       → views/network/lan/LanConfig.vue
views/settings/WirelessSettings.vue      → views/network/wireless/WirelessConfig.vue
views/advanced/NatSettings.vue           → views/advanced/nat/NatConfig.vue
views/basic/SecuritySettings.vue         → views/advanced/SecurityConfig.vue
views/management/ssh/SshManagement.vue   → views/advanced/SshConfig.vue
views/management/ntp/NtpSettings.vue     → views/system/ntp/NtpConfig.vue
views/management/device/*                → views/system/device/*
```

## Benefits of New Structure

1. **Clear Organization**: Logical grouping by functionality
2. **Consistent Naming**: All config pages end with `Config.vue`
3. **Scalability**: Easy to add new features in appropriate categories
4. **Maintainability**: Clear structure makes code easier to find and update
5. **Better Navigation**: Route structure matches directory structure
6. **Backward Compatible**: Old routes redirect to new ones

## Route Names

All routes now have meaningful names for programmatic navigation:

```typescript
// Use route names instead of paths
router.push({ name: 'NetworkWan' });        // /network/wan
router.push({ name: 'AdvancedSsh' });       // /advanced/ssh
router.push({ name: 'SystemAccount' });     // /system/account
```

---

**Last Updated:** 2025-11-14
**Version:** 2.0.0

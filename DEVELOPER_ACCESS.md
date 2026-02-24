# 開發者隱藏功能訪問指南

## 概述

某些功能在正式版本中已被隱藏，但開發人員可以通過特殊方式訪問這些功能進行測試和開發。

## 隱藏功能列表

### 1. WLAN Extender（無線延伸器）
### 2. Guest Access（訪客網路）

## 訪問方式

### 方法一：URL 參數（推薦）

在 Wireless 設定頁面的 URL 後面加上 `?dev=true` 參數：

```
http://your-device-ip/network/wireless?dev=true
```

或直接訪問特定隱藏 tab：

```
# Guest Access
http://your-device-ip/network/wireless?dev=true&tab=guest

# WLAN Extender
http://your-device-ip/network/wireless?dev=true&tab=wlan
```

### 方法二：瀏覽器控制台

在任何頁面打開瀏覽器的開發者工具（F12），在 Console 中執行：

```javascript
sessionStorage.setItem('wirelessDevMode', 'true');
```

然後重新訪問 Wireless 頁面：

```
http://your-device-ip/network/wireless
```

## 功能說明

### 啟用後的效果

- **顯示隱藏的 Tab**：Guest Access 和 WLAN Extender 會出現在 Wireless 設定頁面的 tab 列表中
- **會話持久性**：啟用後，在當前瀏覽器會話（Session）中保持啟用狀態
- **不影響其他用戶**：此設定僅在當前瀏覽器會話中有效，不會影響其他用戶

### 停用方法

#### 方法一：關閉瀏覽器標籤
關閉瀏覽器標籤或瀏覽器，下次訪問時將恢復為正常模式。

#### 方法二：清除 Session Storage
在瀏覽器控制台執行：

```javascript
sessionStorage.removeItem('wirelessDevMode');
```

然後刷新頁面。

## 安全性說明

1. **僅前端隱藏**：這些功能僅在前端界面隱藏，後端 API 仍然可用
2. **會話級別**：設定僅在當前瀏覽器會話中有效，關閉瀏覽器後失效
3. **不存儲在本地**：不使用 localStorage，避免永久保存
4. **無需特殊權限**：任何能訪問系統的用戶都可以啟用，建議配合用戶權限控制

## 使用場景

- **開發測試**：開發人員測試 WLAN Extender 和 Guest Access 功能
- **特殊配置**：在特殊情況下需要訪問這些功能
- **調試問題**：排查與這些功能相關的問題

## 技術實現

### 檢測邏輯

```typescript
const isDeveloperMode = computed(() => {
  return route.query.dev === 'true' || sessionStorage.getItem('wirelessDevMode') === 'true';
});
```

### Tab 顯示邏輯

```typescript
const tabs = computed(() => {
  const baseTabs = [
    { id: 'basic', label: t('wireless.basicConfig') },
    { id: 'advanced', label: t('wireless.advancedConfig') },
    { id: 'wps', label: t('wireless.wpsConfig') },
    { id: 'mesh', label: t('wireless.meshNetwork') }
  ];

  // 只有在開發者模式下才顯示
  if (isDeveloperMode.value) {
    baseTabs.push(
      { id: 'guest', label: t('guest.title') },
      { id: 'wlan', label: t('wireless.wlanExtender') }
    );
  }

  baseTabs.push({ id: 'zones', label: t('wireless.wifiZones') });

  return baseTabs;
});
```

## 快速訪問連結

假設設備 IP 是 `192.168.1.1`：

- 啟用開發者模式：http://192.168.1.1/network/wireless?dev=true
- Guest Access：http://192.168.1.1/network/wireless?dev=true&tab=guest
- WLAN Extender：http://192.168.1.1/network/wireless?dev=true&tab=wlan

---

**注意**：此功能僅供開發和測試使用，請勿在生產環境中長期啟用。

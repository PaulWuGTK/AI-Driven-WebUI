# BasicWanCht JSON 格式調整說明

## 變更摘要

根據同事提供的新 JSON 格式，已完成以下調整：

### 1. 欄位名稱變更

#### PPPoE
- `PassThrough` → `PassthroughEnable`
- `IPv4` → `IPv4Enable`
- `IPv6` → `IPv6Enable`
- `NAT` → `NATEnable`
- `IGMP` → `IGMPEnable`
- `VLAN` → `VLANEnable`
- 新增：`ListConnectionTrigger` (GET 專用)
- 新增：`ListDNSMode` (GET 專用)

#### IPoE
- `Option60` → `Option60Enable`
- `VendorID` → `Option60Value`
- `Option61` → `Option61Enable`
- `DUID` → `Option61Value`
- `IPv4` → `IPv4Enable`
- `IPv6` → `IPv6Enable`
- `NAT` → `NATEnable`
- `IGMP` → `IGMPEnable`
- `VLAN` → `VLANEnable`
- 新增：`ListProtocol` (GET 專用)
- 新增：`ListDNSMode` (GET 專用)

#### Bridge
- `SupportedLANInterfaces` → `ListSupportedLANInterfaces` (GET 專用)
- `LANInterfaces` → `ListLANInterfaces` (GET 和 POST 都需要)
- `VLAN` → `VLANEnable`

### 2. 更新檔案清單

1. **類型定義** (`src/types/basicWanCht.ts`)
   - 更新三個 interface 的欄位名稱
   - 新增 List 欄位為可選 (optional) 屬性

2. **Mock 資料** (`src/services/mockData/basicWanChtMockData.ts`)
   - 更新測試資料以符合新格式
   - 加入 List 欄位的測試值

3. **API 處理** (`src/services/api/basicWanCht.ts`)
   - POST 請求時使用解構賦值移除 List 欄位
   - Bridge 保留 ListLANInterfaces 在 POST 請求中

4. **元件更新**
   - `src/views/network/wan/BasicWanCht.vue` - 更新表格顯示邏輯
   - `src/components/basicWanCht/PPPoEEditForm.vue` - 更新表單欄位綁定
   - `src/components/basicWanCht/IPoEEditForm.vue` - 更新表單欄位綁定
   - `src/components/basicWanCht/BridgeEditForm.vue` - 更新表單欄位綁定

### 3. API 行為

#### GET 請求
回傳完整資料，包含所有 List 欄位用於下拉選單選項

#### POST 請求
- 移除 PPPoE 的 `ListConnectionTrigger` 和 `ListDNSMode`
- 移除 IPoE 的 `ListProtocol` 和 `ListDNSMode`
- 移除 Bridge 的 `ListSupportedLANInterfaces`
- **保留** Bridge 的 `ListLANInterfaces`（這是唯一在 POST 時需要的 List 欄位）

### 4. 驗證狀態

✅ TypeScript 類型定義已更新
✅ Mock 資料已更新
✅ API 處理已更新
✅ 所有相關元件已更新
✅ 建置檢查完成（無 BasicWanCht 相關錯誤）

## 使用範例

### GET Response
```json
{
  "BasicWanCht": {
    "PPPoE": {
      "Enable": false,
      "IPv4Enable": true,
      "ListConnectionTrigger": ["AlwaysOn", "OnDemand"],
      "ListDNSMode": ["Auto", "Manual"]
    }
  }
}
```

### POST Request
```json
{
  "BasicWanCht": {
    "PPPoE": {
      "Enable": false,
      "IPv4Enable": true
    }
  }
}
```

注意：List 欄位在 POST 時會自動被移除（Bridge 的 ListLANInterfaces 除外）

# 文件測試指南 (Documentation Testing Guide)

> 本文件說明如何測試 `docs-local-ref` 的完整性和可用性，驗證是否可以僅用這些文件重建前端頁面。

---

## 1. 測試目的 (Testing Purpose)

**主要目標：** 驗證開發者可以**不看原始碼**，僅使用 `docs-local-ref` 文件重建一個功能完整的頁面。

**驗證項目：**
- ✅ API 文件是否足夠詳細（request/response 格式完整）
- ✅ 資料模型是否清楚（欄位定義明確）
- ✅ UI 元件是否可用（props 定義完整）
- ✅ 樣式是否一致（色彩、間距、字體統一）
- ✅ i18n 是否完整（多語系文字不漏）

---

## 2. 測試準備 (Preparation)

### 2.1 複製文件到獨立目錄

```bash
# 1. 建立測試目錄
mkdir ~/webui-docs-test
cd ~/webui-docs-test

# 2. 複製所有文件
cp -r /path/to/AI-Driven-WebUI/docs-local-ref ./

# 3. 驗證文件完整性
ls docs-local-ref/
# 應該看到：
# 00-completeness-checklist.md
# 01-api-specification.md
# 02-data-models.md
# 03-page-structure.md
# 04-routing-permissions.md
# 05-ui-components.md
# 06-style-guide.md
# 07-i18n-guide.md
# MILESTONE-SUMMARY.md
# verify-coverage.sh
```

### 2.2 選擇測試頁面

**建議從簡單的開始：**

| 難度 | 頁面 | 特性 | 適合 |
|------|------|------|------|
| ⭐ 簡單 | LAN Status | 只讀資料展示 | 第一次測試 |
| ⭐⭐ 中等 | Port Forwarding | 表格 + CRUD | 熟悉後測試 |
| ⭐⭐⭐ 複雜 | Wireless Config | 多 tab + 複雜表單 | 進階測試 |

**本指南使用 LAN Status 作為範例**

---

## 3. 測試流程 (Testing Workflow)

### 步驟 1：閱讀頁面結構文件

```bash
# 開啟 03-page-structure.md，搜尋 "LAN Status"
grep -A 30 "### 4.3 LAN 狀態" docs-local-ref/03-page-structure.md
```

**應該找到：**
```markdown
### 4.3 LAN 狀態
**路徑:** `/status/lan`
**API:** `GET /API/info?list=StatusLan`

**顯示:**
- 每個 LAN 介面的 MAC, MTU, IPv4/IPv6 資訊
```

### 步驟 2：查找 API 規格

```bash
# 開啟 01-api-specification.md，搜尋 "StatusLan"
grep -A 20 "StatusLan" docs-local-ref/01-api-specification.md
```

**應該找到：**
```markdown
### 4.3 LAN 狀態
```
GET /API/info?list=StatusLan
```
**Response:** `LanStatusResponse`
```

### 步驟 3：查找資料模型

```bash
# 開啟 02-data-models.md，搜尋 "LanStatusResponse"
grep -A 40 "LanStatusResponse" docs-local-ref/02-data-models.md
```

**應該找到資料結構定義**

### 步驟 4：選擇 UI 元件

```bash
# 開啟 05-ui-components.md，查看可用元件
cat docs-local-ref/05-ui-components.md
```

**需要的元件：**
- `SectionCard` - 頁面容器
- 資料顯示（可用簡單的 key-value 對）

### 步驟 5：查找樣式定義

```bash
# 開啟 06-style-guide.md，查看色彩、間距
cat docs-local-ref/06-style-guide.md
```

### 步驟 6：查找 i18n 定義

```bash
# 開啟 07-i18n-guide.md 或搜尋現有翻譯
grep -r "lanStatus\|lan\." docs-local-ref/
```

---

## 4. 實際測試範例 (Practical Example)

### 4.1 給 AI 的提示詞範例

**情境：** 你要請 AI（Claude, ChatGPT, etc.）根據文件生成 LAN Status 頁面

**提示詞模板：**

```
我有一套完整的 WebUI 技術文件（docs-local-ref），我想要你根據這些文件，
用 [Lua/Python/JavaScript] 生成一個 LAN Status 頁面。

請遵循以下步驟：

1. 閱讀 `03-page-structure.md`，找到 "4.3 LAN 狀態" 的描述
2. 閱讀 `01-api-specification.md`，找到 StatusLan API 的規格
3. 閱讀 `02-data-models.md`，找到 LanStatusResponse 的資料結構
4. 閱讀 `05-ui-components.md`，選擇合適的 UI 元件
5. 閱讀 `06-style-guide.md`，使用正確的色彩和間距
6. 閱讀 `07-i18n-guide.md`，使用正確的翻譯鍵

要求：
- 使用 SectionCard 元件作為容器
- 顯示所有 LAN 介面的資訊
- 使用正確的 CSS 變數（從 style-guide）
- 所有文字使用 i18n 翻譯鍵（不可硬編字串）
- API 呼叫使用正確的 endpoint

請生成：
1. 頁面的 HTML/Vue/Lua 程式碼
2. API 呼叫的程式碼
3. 樣式定義（使用 CSS 變數）

注意：請不要參考原始專案的程式碼，只使用 docs-local-ref 文件。
```

---

### 4.2 預期的 AI 輸出範例

**AI 應該能產生類似以下的程式碼：**

#### Lua 範例（使用文件資訊）

```lua
-- lan_status.lua
-- 根據 docs-local-ref/03-page-structure.md 和 01-api-specification.md

local http = require("socket.http")
local json = require("json")

-- API 呼叫（從 01-api-specification.md）
function fetch_lan_status()
    local url = "/API/info?list=StatusLan"
    local response, status = http.request(url)

    if status == 200 then
        return json.decode(response)
    else
        return nil, "Failed to fetch LAN status"
    end
end

-- HTML 生成（根據 05-ui-components.md 的 SectionCard）
function render_lan_status(data)
    local html = [[
        <div class="section-card" style="
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: var(--space-6);
            box-shadow: var(--shadow-md);
        ">
            <div class="section-header">
                <h2 style="
                    color: var(--text-primary);
                    font-size: var(--font-size-2xl);
                    font-weight: var(--font-weight-semibold);
                    margin-bottom: var(--space-4);
                ">
                    ]] .. i18n("lan.title") .. [[
                </h2>
            </div>
            <div class="section-content">
    ]]

    -- 根據 02-data-models.md 的 LanStatusResponse 結構
    if data and data.StatusLan and data.StatusLan.Interfaces then
        for _, interface in ipairs(data.StatusLan.Interfaces) do
            html = html .. [[
                <div class="interface-info" style="
                    margin-bottom: var(--space-4);
                    padding: var(--space-4);
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-md);
                ">
                    <h3 style="
                        color: var(--text-primary);
                        font-size: var(--font-size-lg);
                        margin-bottom: var(--space-3);
                    ">
                        ]] .. interface.Name .. [[
                    </h3>

                    <div class="info-row" style="
                        display: flex;
                        margin-bottom: var(--space-2);
                    ">
                        <span class="label" style="
                            flex: 1;
                            color: var(--text-secondary);
                            font-weight: var(--font-weight-medium);
                        ">
                            ]] .. i18n("lan.macAddress") .. [[
                        </span>
                        <span class="value" style="
                            flex: 2;
                            color: var(--text-primary);
                            font-family: var(--font-family-mono);
                        ">
                            ]] .. interface.MACAddress .. [[
                        </span>
                    </div>

                    <div class="info-row" style="display: flex; margin-bottom: var(--space-2);">
                        <span class="label" style="flex: 1; color: var(--text-secondary);">
                            ]] .. i18n("lan.ipv4Address") .. [[
                        </span>
                        <span class="value" style="flex: 2; color: var(--text-primary); font-family: var(--font-family-mono);">
                            ]] .. interface.IPv4Address .. [[
                        </span>
                    </div>

                    <div class="info-row" style="display: flex; margin-bottom: var(--space-2);">
                        <span class="label" style="flex: 1; color: var(--text-secondary);">
                            ]] .. i18n("lan.status") .. [[
                        </span>
                        <span class="value" style="flex: 2;">
                            <span class="status-badge" style="
                                background: ]] .. (interface.Status == "Up" and "var(--color-success-light)" or "var(--color-error-light)") .. [[;
                                color: ]] .. (interface.Status == "Up" and "var(--color-success)" or "var(--color-error)") .. [[;
                                padding: var(--space-1) var(--space-2);
                                border-radius: var(--radius-sm);
                                font-size: var(--font-size-sm);
                            ">
                                ]] .. interface.Status .. [[
                            </span>
                        </span>
                    </div>
                </div>
            ]]
        end
    else
        html = html .. [[
            <p style="color: var(--text-secondary);">
                ]] .. i18n("lan.noData") .. [[
            </p>
        ]]
    end

    html = html .. [[
            </div>
        </div>
    ]]

    return html
end

-- 主函數
function main()
    local data, err = fetch_lan_status()

    if data then
        return render_lan_status(data)
    else
        return "<p style='color: var(--color-error);'>" .. i18n("error.loadFailed") .. "</p>"
    end
end

return main()
```

---

#### Vue 範例（使用文件資訊）

```vue
<!-- LanStatus.vue -->
<!-- 根據 docs-local-ref 文件生成 -->

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import SectionCard from '@/components/common/SectionCard.vue';

// 根據 07-i18n-guide.md
const { t } = useI18n();

// 根據 02-data-models.md 的 LanStatusResponse
interface LanInterface {
  Name: string;
  MACAddress: string;
  IPv4Address: string;
  SubnetMask: string;
  Status: string;
  MTU: number;
}

interface LanStatusResponse {
  StatusLan: {
    Interfaces: LanInterface[];
  };
}

const lanData = ref<LanInterface[]>([]);
const loading = ref(true);
const error = ref('');

// 根據 01-api-specification.md
const fetchLanStatus = async () => {
  try {
    const response = await fetch('/API/info?list=StatusLan', {
      headers: {
        'Authorization': `bearer ${sessionStorage.getItem('sessionID')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch LAN status');
    }

    const data: LanStatusResponse = await response.json();
    lanData.value = data.StatusLan?.Interfaces || [];
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchLanStatus();
});
</script>

<template>
  <!-- 使用 05-ui-components.md 的 SectionCard -->
  <SectionCard :title="t('lan.title')">
    <div v-if="loading" class="loading">
      {{ t('common.loading') }}
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else class="lan-interfaces">
      <div
        v-for="(iface, index) in lanData"
        :key="index"
        class="interface-card"
      >
        <h3 class="interface-name">{{ iface.Name }}</h3>

        <div class="info-row">
          <span class="label">{{ t('lan.macAddress') }}</span>
          <span class="value mono">{{ iface.MACAddress }}</span>
        </div>

        <div class="info-row">
          <span class="label">{{ t('lan.ipv4Address') }}</span>
          <span class="value mono">{{ iface.IPv4Address }}</span>
        </div>

        <div class="info-row">
          <span class="label">{{ t('lan.subnetMask') }}</span>
          <span class="value mono">{{ iface.SubnetMask }}</span>
        </div>

        <div class="info-row">
          <span class="label">{{ t('lan.status') }}</span>
          <span :class="['status-badge', iface.Status.toLowerCase()]">
            {{ iface.Status }}
          </span>
        </div>

        <div class="info-row">
          <span class="label">{{ t('lan.mtu') }}</span>
          <span class="value">{{ iface.MTU }}</span>
        </div>
      </div>
    </div>
  </SectionCard>
</template>

<style scoped>
/* 根據 06-style-guide.md 的樣式變數 */

.lan-interfaces {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.interface-card {
  padding: var(--space-4);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color-light);
}

.interface-name {
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-3);
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--border-color-light);
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  flex: 1;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.value {
  flex: 2;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  text-align: right;
}

.value.mono {
  font-family: var(--font-family-mono);
}

.status-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.status-badge.up {
  background: var(--color-success-light);
  color: var(--color-success);
}

.status-badge.down {
  background: var(--color-error-light);
  color: var(--color-error);
}

.loading,
.error-message {
  padding: var(--space-4);
  text-align: center;
  color: var(--text-secondary);
}

.error-message {
  color: var(--color-error);
}
</style>
```

---

## 5. 驗證檢查清單 (Validation Checklist)

測試完成後，檢查以下項目：

### 5.1 API 正確性
- [ ] API endpoint 正確（`/API/info?list=StatusLan`）
- [ ] HTTP 方法正確（GET）
- [ ] Request header 包含 Authorization（如需要）
- [ ] Response 資料結構符合 `LanStatusResponse`

### 5.2 資料模型正確性
- [ ] 所有欄位都有顯示
- [ ] 欄位名稱正確（MACAddress, IPv4Address, etc.）
- [ ] 資料型別正確處理

### 5.3 UI 元件正確性
- [ ] 使用了 `SectionCard` 元件
- [ ] 元件 props 使用正確
- [ ] 沒有自創元件（都使用文件中定義的）

### 5.4 樣式一致性
- [ ] 使用 CSS 變數（`var(--color-primary)` 等）
- [ ] 間距符合 8px 系統
- [ ] 色彩使用正確的語意色（success/error）
- [ ] 字體大小使用預定義變數

### 5.5 i18n 完整性
- [ ] 沒有硬編英文字串
- [ ] 所有文字都用 `t()` 或 `i18n()` 函數
- [ ] 翻譯鍵使用正確的命名空間（`lan.*`）

### 5.6 功能完整性
- [ ] 頁面可以正常載入
- [ ] 資料可以正確顯示
- [ ] 錯誤狀態有處理
- [ ] 載入狀態有顯示

---

## 6. 常見問題處理 (Common Issues)

### 問題 1：AI 使用了文件中沒有的元件

**原因：** AI 可能參考了其他知識，而不是文件

**解決方法：**
```
請重新生成，只使用 docs-local-ref/05-ui-components.md 中定義的元件。
可用的元件有：BaseInput, BaseTable, BaseModal, SectionCard 等。
請不要使用文件中沒有列出的元件。
```

### 問題 2：AI 硬編了英文字串

**原因：** 沒有強調 i18n 的重要性

**解決方法：**
```
請修改所有硬編的字串，改用 i18n 翻譯鍵。
參考 docs-local-ref/07-i18n-guide.md 的命名規則。
例如："LAN Status" 應改為 t('lan.title')
```

### 問題 3：樣式沒有使用 CSS 變數

**原因：** 沒有強調樣式指南

**解決方法：**
```
請使用 docs-local-ref/06-style-guide.md 定義的 CSS 變數。
例如：color: #0070BB 應改為 color: var(--color-primary)
```

### 問題 4：API 呼叫格式錯誤

**原因：** 沒有參考 API 規格文件

**解決方法：**
```
請參考 docs-local-ref/01-api-specification.md 的 API 規格。
確認 endpoint、HTTP 方法、request/response 格式都正確。
```

---

## 7. 進階測試 (Advanced Testing)

### 7.1 測試複雜頁面（Port Forwarding）

**特點：**
- 使用 BaseTable 元件
- 有 CRUD 操作（新增/編輯/刪除）
- 使用 BaseModal 對話框
- 表單驗證

**提示詞範例：**
```
請根據 docs-local-ref 文件，生成 Port Forwarding 頁面。

要求：
1. 使用 BaseTable 顯示規則列表
2. 使用 BaseModal 進行新增/編輯
3. 表單使用 BaseInput 和 BaseSelect
4. 刪除操作需要確認對話框
5. 所有文字使用 i18n
6. 樣式使用 CSS 變數
```

### 7.2 測試 i18n 切換

驗證生成的頁面是否支援多語言切換：

```javascript
// 測試語言切換
i18n.locale = 'zh-TW';  // 切換到繁體中文
i18n.locale = 'en';     // 切換回英文
```

檢查：
- [ ] 所有文字都正確切換
- [ ] 沒有漏掉的英文字串
- [ ] 翻譯鍵都存在

---

## 8. 測試報告範本 (Test Report Template)

完成測試後，填寫以下報告：

```markdown
# 文件可用性測試報告

**測試日期：** YYYY-MM-DD
**測試者：** 姓名
**測試頁面：** 頁面名稱

## 測試環境
- AI 工具：Claude / ChatGPT / 其他
- 實作語言：Lua / Vue / React / 其他
- 文件版本：docs-local-ref (日期)

## 測試結果

### 1. 文件完整性
- [ ] API 規格足夠詳細
- [ ] 資料模型定義清楚
- [ ] UI 元件可用
- [ ] 樣式指南完整
- [ ] i18n 指南清楚

### 2. 生成程式碼品質
- [ ] API 呼叫正確
- [ ] 資料結構正確
- [ ] UI 元件使用正確
- [ ] 樣式一致
- [ ] i18n 完整

### 3. 遇到的問題
1. 問題描述
   - 原因：
   - 解決方法：

2. 問題描述
   - 原因：
   - 解決方法：

### 4. 文件改善建議
- 建議 1：
- 建議 2：

### 5. 總評
- **可用性：** ⭐⭐⭐⭐⭐ (1-5 星)
- **完整性：** ⭐⭐⭐⭐⭐ (1-5 星)
- **易用性：** ⭐⭐⭐⭐⭐ (1-5 星)

### 6. 結論
[可以/不可以] 僅用文件重建頁面

### 7. 附件
- 生成的程式碼：[連結或檔案]
- 截圖：[如有]
```

---

## 9. 總結

**成功的測試應該：**
1. ✅ 不需要查看原始碼
2. ✅ 生成的程式碼符合文件規範
3. ✅ API 呼叫正確
4. ✅ 樣式一致
5. ✅ i18n 完整
6. ✅ 功能可用

**如果測試失敗：**
1. 記錄遇到的問題
2. 找出文件缺失的部分
3. 補充或修正文件
4. 重新測試

**持續改進：**
- 每次測試後更新文件
- 補充遺漏的資訊
- 優化範例說明
- 保持文件與程式碼同步

---

**下一步：**
- 實際執行一次測試
- 填寫測試報告
- 根據反饋改善文件

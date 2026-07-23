# WebUI Generator — Claude Code Skills

本目錄包含 Claude Code 用於生成與維護 Gemtek Router WebUI 頁面的 skill 與參考文件。

## 目錄結構

```
.claude/skills/
├── README.md                        ← 本文件
└── webui-generator/                 ← WebUI 頁面生成 Skill
    ├── SKILL.md                     ← Skill 定義：頁面生成與修正規則
    └── reference/                   ← 設計規範參考文件
        ├── 00-completeness-checklist.md
        ├── 01-api-specification.md
        ├── 02-data-models.md
        ├── 03-page-structure.md
        ├── 04-routing-permissions.md
        ├── 05-ui-components.md
        ├── 06-style-guide.md
        ├── 07-i18n-guide.md
        ├── 08-testing-guide.md
        └── QUICK-TEST.md
```

---

## 使用模式

### 模式 A：搭配 GitHub 專案原始碼，新增頁面或修正問題

**適用情境：** 已有 WebUI 的 GitHub 專案原始碼，需要在此基礎上新增頁面、或根據 Jira issue / 需求修正現有頁面的問題。

**使用方式：**

先將 WebUI 專案 clone 到本地：

```bash
# 將 WebUI 專案 clone 到 workspace 中
git clone <WebUI GitHub URL> ~/workspace/webui-project
```

新增頁面：

```
WebUI 專案在 ~/workspace/webui-project，
請使用 webui-generator skill 新增 LAN Status 頁面。
Lua 檔案在：referfolder/webui-generic/prpl/StatusLan.lua
```

根據 Jira issue 修正問題：

```
WebUI 專案在 ~/workspace/webui-project，
請讀取 Jira ticket PCSDW1-139 的內容，分析問題並修正對應頁面。
```

**流程：**
1. Clone WebUI 專案到本地
2. 提供需求（Lua 檔案 / API response / Jira ticket ID）
3. Claude 讀取專案現有程式碼，了解架構與元件
4. 使用 `webui-generator` skill + `reference/` 文件新增或修正頁面
5. 執行 build 驗證，確保無錯誤

**優點：** 可直接在現有專案上操作，確保新增或修正的頁面與整體架構一致

---

### 模式 B：不搭配原始網頁，從零生成

**適用情境：** 沒有原始 WebUI 可參考（例如新專案或離線開發環境），完全依賴 `reference/` 文件從零生成頁面。

**使用方式：**

```
請使用 webui-generator skill，根據以下 Lua 檔案生成 Statistics 頁面。
Lua 檔案路徑：referfolder/webui-generic/prpl/Statistics.lua
頁面放在 Status 選單下。
```

或只提供 API response：

```
請使用 webui-generator skill，根據以下 API response 生成頁面：
{
  "Statistics": {
    "Ethernet": [
      { "Port": "eth0", "RxBytes": "123456", "TxBytes": "789012" }
    ]
  }
}
頁面名稱：Statistics，放在 Status 選單下。
```

**流程：**
1. 提供 Lua 檔案和/或 API response JSON
2. Claude 讀取 `reference/` 下的設計規範（style guide、components、i18n 等）
3. 依據 `webui-generator` skill 的步驟逐一生成所有檔案
4. 執行 build 驗證

**產出檔案清單：**
- `src/types/{feature}.ts` — TypeScript 型別
- `src/services/mockData/{feature}MockData.ts` — Mock 資料
- `src/services/api.ts` 或 `src/services/api/{feature}.ts` — API 服務
- `src/views/{section}/{Feature}.vue` — Vue 頁面元件
- `src/router/index.ts` — 路由設定
- `src/components/Sidebar.vue` — 選單項目
- `src/types/menuVisibility.ts` — 選單可見性規則
- `src/i18n/locales/*.ts` × 7 — 多國語系翻譯

**注意事項：** 此模式完全依賴 `reference/` 文件的完整性。如發現產出與預期不符，應先更新文件再重新生成。

---

### 模式 C：搭配 Jira ID 使用

**適用情境：** 透過 Jira ticket 驅動頁面修正或生成，可整合自動化腳本定期檢查是否有待處理的 WebUI 問題。

**Jira 專案資訊：**
- Board: `PCSDW1` — https://gemteks-jira.atlassian.net/jira/software/c/projects/PCSDW1/boards/765
- Quick Filter: `?quickFilter=370`（WebUI 相關 ticket）
- 範例 ticket: `PCSDW1-139` — https://gemteks-jira.atlassian.net/browse/PCSDW1-139

**預期使用方式：**

```
請處理 Jira ticket PCSDW1-139，根據 ticket 描述修正對應頁面的問題。
```

或批次處理：

```
請列出 PCSDW1 專案中 quickFilter=370 的待處理 ticket，
逐一分析哪些可以自動修正。
```

#### 環境設定（前置作業）

Jira Cloud 使用 Atlassian API Token 認證。需要先完成以下設定：

**1. 產生 API Token**
- 前往 https://id.atlassian.com/manage-profile/security/api-tokens
- 建立新的 API token

**2. 設定環境變數**

```bash
# 加入 ~/.bashrc 或 ~/.zshrc
export JIRA_BASE_URL="https://gemteks-jira.atlassian.net"
export JIRA_USER_EMAIL="yourmail@gemteks.com"
export JIRA_API_TOKEN="your-api-token-here"
```

**3. 驗證連線**

```bash
# 測試讀取單一 ticket
curl -s -u "$JIRA_USER_EMAIL:$JIRA_API_TOKEN" \
  "$JIRA_BASE_URL/rest/api/3/issue/PCSDW1-139" | jq '.fields.summary, .fields.status.name'

# 測試查詢未完成的 tickets（注意：Atlassian 已棄用 /search，改用 /search/jql）
curl -s -u "$JIRA_USER_EMAIL:$JIRA_API_TOKEN" \
  "$JIRA_BASE_URL/rest/api/3/search/jql?jql=project%3DPCSDW1%20AND%20status%20not%20in%20(Done)&maxResults=10&fields=summary,status" \
  | jq '.issues[] | {key, summary: .fields.summary}'
```

> **注意：** Atlassian 已棄用 `/rest/api/3/search` endpoint，需改用 `/rest/api/3/search/jql`。
> JQL 中不可使用 `!=`，需改用 `not in (Done)` 語法。

#### 整合方式

**階段 1：手動輸入 Jira ID（已可使用）**

在 Claude Code 中直接提供 ticket ID，Claude 透過 curl 讀取 ticket 內容並處理：

```
請用 curl 讀取 Jira ticket PCSDW1-139 的內容，
分析問題描述，然後修正對應的頁面。
```

Claude 會：
1. 用 `curl + JIRA_API_TOKEN` 呼叫 Jira REST API 讀取 ticket
2. 解析 `fields.summary`、`fields.description`、`fields.attachment` 等欄位
3. 判斷影響的頁面與修正方式
4. 選擇模式 A 或模式 B 進行處理
5. 修正完成後可自動在 ticket 上新增 comment

**階段 2：自動化腳本（未來）**

```bash
#!/bin/bash
# scripts/process-jira-tickets.sh

# 查詢所有待處理的 WebUI ticket（使用新版 /search/jql endpoint）
TICKETS=$(curl -s -u "$JIRA_USER_EMAIL:$JIRA_API_TOKEN" \
  "$JIRA_BASE_URL/rest/api/3/search/jql?jql=project%3DPCSDW1%20AND%20status%20not%20in%20(Done)&maxResults=20&fields=summary,status" \
  | jq -r '.issues[].key')

for TICKET in $TICKETS; do
  echo "Processing $TICKET..."
  # 呼叫 Claude Code 處理每個 ticket
  claude -p "請讀取 Jira ticket $TICKET 的內容並修正對應的頁面問題"
done
```

**階段 3：定期巡檢 + PR 產生（遠期）**
- 排程 cron job 或 CI pipeline 定期執行腳本
- 自動分類 ticket：可自動處理 vs 需要人工介入
- 對可自動處理的 ticket 產生 branch、修正、建立 PR
- 將 PR 連結回寫到 Jira ticket comment
- 指派 reviewer 進行 code review

**目前狀態：** 已驗證 Jira API Token 可正常使用。可直接在 Claude Code 中提供 ticket ID 進行處理。

---

## 技術棧

| 項目 | 技術 |
|------|------|
| 前端框架 | Vue 3 + TypeScript + Vite |
| 路由 | Vue Router 4 |
| 國際化 | Vue I18n（7 語系：en, zh-TW, zh-CN, ja, ko, fr, de） |
| 樣式 | CSS Variables 設計系統（見 `reference/06-style-guide.md`） |
| 元件 | BaseTable, BaseModal, BaseSelect（見 `reference/05-ui-components.md`） |
| 建置驗證 | `vue-tsc -b && vite build` |

## 常用指令

```bash
# 開發模式
npm run dev

# 建置驗證（TypeScript 檢查 + 打包）
npm run build

# 使用 webui-generator skill 生成頁面
# 在 Claude Code 中直接對話即可觸發
```

## reference 文件說明

| 文件 | 用途 |
|------|------|
| `01-api-specification.md` | API endpoint 規格、request/response 格式 |
| `02-data-models.md` | TypeScript 型別定義規範、PascalCase 命名 |
| `03-page-structure.md` | 頁面層級結構、Application Chrome（Sidebar/Header/Login） |
| `04-routing-permissions.md` | 路由、redirect、選單可見性規則 |
| `05-ui-components.md` | 可用 UI 元件的 props/slots/events |
| `06-style-guide.md` | CSS 變數、色彩、間距、字體、全域 class |
| `07-i18n-guide.md` | 多語系翻譯命名規則與品質要求 |
| `08-testing-guide.md` | 文件可用性測試流程 |

# AI-Driven WebUI

Gemtek Router WebUI — Vue 3 + TypeScript + Vite 前端專案，搭配 Claude Code AI 輔助開發。

## 技術棧

| 項目 | 技術 |
|------|------|
| 前端框架 | Vue 3 (Composition API + `<script setup>`) |
| 語言 | TypeScript |
| 建置工具 | Vite 5 |
| 路由 | Vue Router 4 |
| 國際化 | Vue I18n（7 語系：en, zh-TW, zh-CN, ja, ko, fr, de） |
| HTTP | Axios |
| 圖表 | Chart.js + vue-chartjs, D3.js |
| 樣式 | CSS Variables 設計系統 |

## 環境需求

- **Node.js** >= 18（建議 20.x）
- **npm** >= 9

## 安裝與啟動

```bash
# 安裝套件
npm install

# 開發模式（預設 http://localhost:5173）
npm run dev

# TypeScript 檢查 + 生產環境建置
npm run build

# 預覽建置結果
npm run preview
```

## 專案架構

```
src/
├── assets/              # 靜態資源（圖片、SVG）
├── components/          # 共用元件（Sidebar, Header, BaseTable, BaseModal...）
├── composables/         # Vue Composables（共用邏輯）
├── i18n/
│   └── locales/         # 7 種語系翻譯檔 + types.ts
├── router/              # Vue Router 路由設定
├── services/
│   ├── api/             # API Service 層（各頁面 normalizer）
│   └── mockData/        # Mock 資料（開發環境用）
├── styles/              # 全域 CSS + 設計系統變數
├── types/               # TypeScript 型別定義
├── utils/               # 工具函式（驗證、格式化）
├── views/               # 頁面元件
│   ├── status/          # Status 區段（LAN/WAN/WLAN Status...）
│   ├── network/         # Network 區段（LAN/WAN/Wireless 設定...）
│   ├── advanced/        # Advanced 區段（Security, NAT, Routing...）
│   ├── system/          # System 區段（Firmware, Backup, NTP...）
│   ├── application/     # Application 區段（DDNS, UPnP...）
│   ├── iot/             # IoT 區段（Thread, Matter）
│   └── wizard/          # Setup Wizard
├── App.vue              # 根元件
└── main.ts              # 進入點
```

## 建置與打包

```bash
# 建置（TypeScript 檢查 + Vite 打包）
npm run build

# 打包成 tar.gz（部署用）
tar -czf dist.tar.gz dist
```

建置產出在 `dist/` 目錄，打包後的 `dist.tar.gz` 可直接部署到設備。

## 部署到設備（DUT）

WebUI 部署目標路徑為 `/www/`（不是 `/www/webui/`）。

```bash
# 完整部署流程
scp -O dist.tar.gz root@192.168.1.1:/tmp/dist.tar.gz
ssh root@192.168.1.1 "cd /tmp && tar zxf dist.tar.gz && rm -rf /www/* && cp -a dist/* /www/ && sync"
```

## Git 分支

本專案依板子類型區分分支，命名規則為 `{BoardType}WebUI-{日期}`：

- **GFiberWebUI-\*** — GFiber 板子專用
- **GenericWebUI-\*** — Generic 板子專用（內部 Gitea mirror，SDK Makefile 會釘死 commit hash）

兩個分支程式碼一致，透過 cherry-pick 同步。每次 commit 都包含 `dist.tar.gz` 建置產物。

> **注意：** GenericWebUI 分支禁止 force push，因為 Gitea mirror 會同步，force push 會導致 SDK build 找不到已釘死的 commit。

## AI 輔助開發（Claude Code）

本專案使用 Claude Code 作為 AI 開發助手。使用前需先設定 Skills：

1. 安裝 Claude Code：`npm install -g @anthropic-ai/claude-code`
2. 從內部 Skills 倉庫 clone 設定檔到專案的 `.claude/` 目錄（倉庫位址請洽團隊負責人）
3. 在專案目錄執行 `claude`
4. 直接對話描述需求，例如：
   - 「請根據 StatusLan.lua 生成 LAN Status 頁面」
   - 「請修正 WiFi 頁面的 SSID 驗證問題」
   - 「請讀取 Jira ticket PCSDW1-XXX 並修正對應頁面」

詳細說明見 `.claude/skills/README.md`。

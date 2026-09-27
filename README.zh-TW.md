# All-In-One Free SEO Tool — 台灣繁體中文版（Fork）

> 本專案是 **[All-In-One-Free-SEO-Tool](https://github.com/IamRamgarhia/All-In-One-Free-SEO-Tool)**（作者：**DiceCodes / Prince Ramgarhia**，採 **MIT 授權**）的 Fork，
> 針對台灣市場與繁體中文內容做在地化。原始授權條款請見 [LICENSE](./LICENSE)（未修改）。
> 英文原版說明請見 [README.md](./README.md)（內容維持上游原文，未改寫）。

這是一套可自架、在本機執行的 SEO 工具組（Next.js + SQLite）：網站健檢、關鍵字研究、內容評分、Meta 標籤、robots.txt / Sitemap、結構化資料、排名追蹤、反向連結等。
本 Fork 的第一階段（Phase 1）目標是：**讓中文內容量得準、關鍵字查的是台灣的 Google、介面與 AI 輸出預設為繁體中文。**

---

## 本 Fork 改了什麼（Phase 1）

### 1. 中文字數與斷詞
- 新增 `src/lib/text/segment.ts`：使用內建 `Intl.Segmenter('zh-Hant', { granularity: 'word' })` 斷詞，不支援時自動退回「拉丁單字 + 中日韓字元」估算。支援中英混排。
- 原本約 30 處以空白切割（`split(/\s+/)`）計算字數的地方全部改用這個工具——中文頁面不再被判定成「只有 3 個字」。
- **門檻換算規則**（寫在 `segment.ts` 註解中）：
  - 以中文為主的文字（CJK 字元佔多數）改用**字元數**判斷，換算比例 `1.5 個中文字 ≈ 1 個英文單字`。
  - 例：原本「少於 200 字為內容過少（thin content）」→ 中文頁面為「少於 300 字」。
  - 關鍵字詞數（長尾判斷）：中文以 `ceil(中文字數 / 2)` 視為詞數，再加上英文單字數。例：「最便宜 筆電 推薦」= 4 詞 → 長尾。
  - 閱讀時間：中文以每分鐘 400 字計算；句子切分支援「。！？」。
- 內容評分、關鍵字分群、內部連結建議等 tokenizer 加入中文詞彙切分與中文停用詞。

### 2. 搜尋地區與語言（台灣）
- 新增 `src/lib/locale.ts`，所有 Google 建議字詞（autocomplete）、SERP、Google Trends、排名檢查、在地排名、知識面板等呼叫改用可設定的 `hl` / `gl`，預設 **`hl=zh-TW`、`gl=tw`**（Trends 時區 UTC+8）。
- 國家預設值由 `US` 改為 `TW`；國家清單加入台灣、香港。
- 關鍵字延伸修飾詞加入中文（推薦、比較、評價、ptt、dcard、價格…），中文種子字會查中文維基百科。

### 3. 搜尋意圖分類（中文）
- 新增 `src/lib/text/intent-zh.ts`，辨識繁體（與常見簡體）中文意圖訊號：
  - 資訊型：如何、怎麼、什麼是、教學、方法、為什麼、意思…
  - 商業調查型：推薦、比較、評價、開箱、ptt、dcard、排行、vs…
  - 交易型：價格、多少錢、優惠、折扣碼、購買、哪裡買、最便宜…
  - 導航型：官網、登入、客服…
- 例：「如何寫部落格」→ 資訊型；「最便宜 筆電 推薦」→ 交易型（同時帶有商業訊號）。

### 4. AI 輸出預設繁體中文
- 所有 AI 功能（摘要、內容建議、助理、視覺分析…）的系統提示加入「使用台灣繁體中文與台灣慣用詞」指示（`src/lib/ai-language.ts`）。
- 優先順序：資料庫設定 `ai.output_language` → 環境變數 `AI_OUTPUT_LANGUAGE` → `DEFAULT_LOCALE`。設為 `en` 即恢復英文。

### 5. 停用上游自動更新
- 上游版本會從 GitHub 上游 main 分支 `git pull` 並 `pnpm install`（`/api/update`、`/api/restart`、設定頁的更新檢查）。在 Fork 中這會把在地化改動覆蓋掉，因此**預設停用**，端點回傳 403。
- 若確定需要，可設 `SEO_ENABLE_AUTO_UPDATE=1`、`NEXT_PUBLIC_SEO_ENABLE_RESTART=1` 重新啟用。

### 6. 繁體中文介面
- 輕量字典式 i18n（`src/lib/i18n/`，不增加套件相依）：`tr("English")` 查表取得繁中字串，找不到則顯示原文。
- 已翻譯：全域版面（`<html lang="zh-Hant-TW">`）、側邊欄與導覽、搜尋面板、歡迎頁、首頁、工具總覽（**全部工具名稱與一句話說明**）、設定頁與各子表單，以及重點工具頁：網站健檢、關鍵字研究、內容評分、Meta 標籤產生器、robots.txt、Sitemap；多數工具頁的標題與說明。
- 用詞採台灣慣用：關鍵字、網站健檢、反向連結、索引、結構化資料、排名追蹤、網址、設定…（有測試防止出現「網站體檢」「鏈接」等大陸用語）。
- 設 `NEXT_PUBLIC_DEFAULT_LOCALE=en` 可恢復英文介面。

---

## 安裝與執行

> ⚠️ 上游 README 中的「一行安裝指令」（`install.sh` / `install.ps1`）會下載**上游英文版**，不是本 Fork。請改用下列手動方式。

需求：**Node.js 22 以上（建議）**、pnpm 10（可用 `npx pnpm@10`）。Linux 需可編譯 `better-sqlite3` 的環境。

```bash
git clone https://github.com/kaochaoting/All-In-One-Free-SEO-Tool.git
cd All-In-One-Free-SEO-Tool
pnpm install
node scripts/migrate.cjs        # 建立 / 更新本機 SQLite 資料庫（data.db）
pnpm dev                        # 開發模式：http://localhost:3000
# 或正式執行：
pnpm build && pnpm start
```

選用：瀏覽器相關工具（排名檢查、截圖等）需要 `npx playwright install chromium`。

### 環境變數（皆為選填，可寫在 `.env.local`）

| 變數 | 預設值 | 說明 |
|---|---|---|
| `DEFAULT_LOCALE` | `zh-TW` | 伺服器端預設語系（搜尋語言、AI 輸出語言的預設來源） |
| `DEFAULT_COUNTRY` | `TW` | 預設國家（Google `gl`、排名檢查、關鍵字研究） |
| `SEARCH_LANGUAGE` | 依 `DEFAULT_LOCALE` | 覆寫 Google `hl` 參數，例如 `en` |
| `AI_OUTPUT_LANGUAGE` | 依 `DEFAULT_LOCALE` | AI 輸出語言；`en` 表示不加繁中指示 |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `zh-TW` | 介面語言；`en` 恢復英文介面（需重新建置） |
| `SEO_ENABLE_AUTO_UPDATE` | 未設定（停用） | 設 `1` 重新啟用從上游自動更新 |
| `NEXT_PUBLIC_SEO_ENABLE_RESTART` | 未設定（停用） | 設 `1` 重新顯示／啟用「重新啟動伺服器」 |

### 測試

```bash
pnpm test                 # vitest 單元測試
npx tsc --noEmit          # 型別檢查
```

---

## 尚未完成（後續階段）

- 多數非重點工具頁的**內頁內容**（表單說明、結果表格欄位）仍為英文；客戶、稽核、報告、代理（Agent）等頁面尚未完整翻譯。
- 伺服器端產生的稽核發現（finding）訊息多數仍為英文（「內容過少」已提供中文）。
- PDF 報告、Email 範本尚未翻譯。
- 資料庫 schema 中既有的預設值（例如客戶預設國家 `US`、語言 `en`）未更動，需另寫 migration。
- 設定頁尚未提供「AI 輸出語言」的下拉選單（目前以環境變數或設定鍵 `ai.output_language` 控制）。
- 上游 README 列出的部分功能，在我們評估時未確認有完整實作；使用前請以實際介面為準。

---

## 致謝與授權

- 本專案基於 **[All-In-One-Free-SEO-Tool](https://github.com/IamRamgarhia/All-In-One-Free-SEO-Tool) by [DiceCodes](https://dicecodes.com)（Prince Ramgarhia）**，依 **MIT License** 授權使用與修改。
- 原始著作權聲明與授權全文保留於 [LICENSE](./LICENSE)。
- 本 Fork 的在地化修改同樣以 MIT 授權釋出。問題與建議請回報到本 Fork，**請勿**將在地化問題回報給上游專案。

# GAS + Google Sheets 履歷網站

這份程式會把 `01_me/me.html` 改成由 Google Sheets 控制內容。
你只要改 Sheets，網站會同步顯示新內容。

## 檔案

- `Code.gs`: 讀取工作表資料、輸出網頁
- `Index.html`: 前端版面（Bootstrap）

## 建立步驟

1. 新建一個 Google 試算表。
2. 在試算表上方選單開啟 `擴充功能 -> Apps Script`。
3. 將 `Code.gs`、`Index.html` 內容貼入 Apps Script 專案。
4. 回到 Apps Script 執行 `setupAllSheets()` 一次（會建立三張表和範例資料）。
5. 如果 Apps Script 專案不是綁在該試算表：
   - 先執行 `setSpreadsheetId("<你的試算表ID>")`，再執行 `setupAllSheets()`。
6. 按 `部署 -> 新部署 -> 網頁應用程式`，存取權設為可公開（依需求）。

## 工作表結構

### 1) `Profile`

欄位：`key`, `value`

必要 key：
- `pageTitle`
- `displayName`
- `tagline`
- `birthDate`
- `email`
- `education`
- `experience`
- `avatarUrl`
- `heroImageUrl`

### 2) `Skills`

欄位：`sort`, `skill`

### 3) `About`

欄位：`sort`, `paragraph`

## 備註

- 圖片建議使用可公開連結（例如 GitHub raw、公開雲端空間）。
- 你改完試算表後，重新整理網頁即可看到更新。
- 若要拿 JSON 資料，可使用：`你的網頁網址?api=1`

# SpielSpot_2.0

保留 SpielSpot React 前端與 Clerk 登入，為重做後端準備的獨立專案。
Supabase 已移除，目前使用本地示範資料，無須啟動 API 伺服器。

## 結構

```text
frontend/   React、TypeScript、Vite、Clerk、UI、路由與測試
backend/    預留新後端，目前只有說明檔
docs/       後端接入說明
```

## 啟動

使用 Node.js 22.12 以上版本。在本專案根目錄執行：

```powershell
npm.cmd --prefix frontend install
npm.cmd run dev
```

開啟 Vite 顯示的網址。macOS/Linux 使用 `npm` 代替 `npm.cmd`。
首頁、搜尋與篩選、地圖、詳細頁、語言和主題切換可以預覽。
儲存尚未開放；新增、編輯與評論表單保留，但不會寫入資料。
示範評分及評論並非真實使用者資料。地圖圖磚、地址查詢與字體仍需網路。

### Clerk 登入

不設定 Clerk 也能瀏覽，登入按鈕會停用。要啟用登入，在根目錄執行：

```powershell
Copy-Item frontend/.env.example frontend/.env.local
```

在新檔案填入 Clerk 的 `VITE_CLERK_PUBLISHABLE_KEY`，再重新啟動 Vite。
可以使用自己的既有 Clerk app；舊專案的 `.env.local` 不會自動複製。
登入成功不代表資料能儲存，仍需新後端接入。不要將 secret key 放進前端。

## 檢查

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

建置輸出在 `frontend/dist/`。部署時設定 SPA fallback 到 `index.html`，
並在確定正式網址後補上 canonical、og:url 及完整 og:image 網址。

## 上傳新的 GitHub repo

在新的 `SpielSpot_2.0` 資料夾初始化 Git。原本的 `Project-Spielspot` 獨立保留。
不要在原專案根目錄執行以下指令。
在 GitHub 建立空白的 `SpielSpot_2.0` repo 後執行：

```powershell
git init
git add .
git status
git commit -m "Initialize SpielSpot 2.0 frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/SpielSpot_2.0.git
git push -u origin main
```

將 `YOUR_USERNAME` 換成自己的帳號。`.gitignore` 已排除依賴、建置輸出和
環境變數檔案。這份專案沒有複製舊 `.git`，會建立全新的提交歷史。

後端需接入的功能見 [接入說明](docs/backend-handoff.md)。


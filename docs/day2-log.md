# Day 2 操作紀錄（2026-09-22）

依照實際完成順序記錄，方便之後回顧或重做，也可以當作下次接 Clerk + Express + 前後端串接的參考手冊。

## 1. Clerk 後端驗證設定

安裝 SDK：
```
npm install @clerk/express
```

去 Clerk Dashboard → API Keys 頁面，拿兩把 key（缺一不可）：
- `CLERK_SECRET_KEY`（後端專用，絕對不能外流）
- `CLERK_PUBLISHABLE_KEY`（跟前端 `VITE_CLERK_PUBLISHABLE_KEY` 同一組值，只是變數名不同）

`backend/.env` 加上：
```
CLERK_SECRET_KEY=sk_test_xxx
CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

**踩過的坑：** 一開始只設定了 `CLERK_SECRET_KEY`，忘記 `clerkMiddleware()` 其實兩把 key 都要，導致錯誤 `Error: Publishable key is missing`。

## 2. 掛載 Clerk Middleware

`server.js`：
```js
import { clerkMiddleware } from "@clerk/express";

app.use(express.json());
app.use(clerkMiddleware()); // 一定要在 routes 掛載之前
```

## 3. 自訂登入檢查 Middleware（比內建 requireAuth() 更透明好客製）

`backend/src/middleware/requireLogin.js`：
```js
import { getAuth } from "@clerk/express";

export function requireLogin(req, res, next) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Please login" });
  }
  next();
}
```

掛在需要登入的 route 上：
```js
router.post("/", requireLogin, createPlayground);
```

## 4. Controller 用登入者 id 覆蓋前端傳來的值（防止冒用）

```js
import { getAuth } from "@clerk/express";

export async function createPlayground(req, res) {
  const { userId } = getAuth(req);
  const playground = await Playground.create({
    ...req.body,
    ownerId: userId, // 放在展開之後，蓋掉前端可能偽造的 ownerId
  });
  res.status(201).json({ success: true, data: playground });
}
```

Review 的 `authorId` 同樣邏輯。

## 5. Ownership Check（PATCH / DELETE 限本人操作）

```js
export async function updatePlayground(req, res) {
  const { userId } = getAuth(req);
  const playground = await Playground.findById(req.params.id);

  if (!playground) return res.status(404).json({ success: false, error: "Playground not found" });
  if (playground.ownerId !== userId) {
    return res.status(403).json({ success: false, error: "Not allowed to edit this playground" });
  }

  Object.assign(playground, req.body);
  await playground.save();
  res.json({ success: true, data: playground });
}
```

`deletePlayground`、`deleteReview` 同樣模式：先查資料、比對 owner、才准許動作。**403（有登入但沒權限）跟 401（根本沒登入）要分清楚**。

## 6. Postman 測試 Clerk 保護的 API（重點技巧）

**拿 token 的方式**：前端登入後，瀏覽器 DevTools → Console →
```js
await window.Clerk.session.getToken()
```
（第一次用 Console 要先打 `allow pasting` 解鎖貼上功能）

Postman → Authorization 分頁 → Type 選 **Bearer Token** → 貼上。

**踩過的坑（都很值得記住）：**
- **Session token 效期很短**（幾十秒到幾分鐘），複製到 Postman 中間拖太久就會 401，測試動作要快，且不能重複用舊 token
- **debug 技巧**：middleware 裡卡 401 但不知道原因時，用 `getAuth(req).debug()` 印出詳細原因，比瞎猜有效率很多
- **路由寫錯**：`/api/playground`（少 s）、method 選錯（複製上一個 request 忘記把 POST 改成 PATCH）都會出現 `Cannot POST/PATCH ...` 這種錯誤，要看清楚錯誤訊息裡的 method 和路徑
- **id 拿錯**：review 的 id 跟 playground 的 id 長得很像，容易複製錯，混用會導致查不到資料或誤判成別的錯誤

## 7. 資安 Middleware

```
npm install helmet cors express-rate-limit
```

```js
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" })); // 白名單前端網域，不要用 "*"

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: "Too many requests, please try again later." },
});
app.use(limiter);
```

## 8. Input Validation：改用 Zod

一開始用 `express-validator`，後來換成 Zod（TS 專案更常見，schema 定義更直覺）：

```
npm install zod
```

`backend/src/validators/playgroundValidator.js`：
```js
import { z } from "zod";

export const playgroundSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  location: z.string().trim().min(1, "location is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  // ...其他欄位
});
```

通用 middleware：
```js
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.issues[0].message });
    }
    req.body = result.data;
    next();
  };
}
```

`.partial()` 很好用：PATCH 時用 `validate(playgroundSchema.partial())`，讓所有欄位變成「有填才檢查」。

## 9. 統一錯誤處理 Middleware

```js
export function errorHandler(err, req, res, next) {
  console.error(err.stack); // 只在 server 端印出，不回傳給前端
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
}
```

放在 **所有 routes 掛載完之後**、`server.js` 最後面：
```js
app.use(errorHandler);
```

**踩過的坑：** `server.js` 裡用到 `errorHandler` 但忘記在最上面 `import`，會直接讓 server 啟動失敗，`ReferenceError: errorHandler is not defined`。

## 10. 前後端欄位對齊（重要教訓：先看前端型別再設計後端 model）

一開始後端 model 是自己設計的欄位（`address`、`lat`、`lng`、`category`），等到要串接前端才發現前端 `PlaygroundMutationInput`／`CreateReviewInput` 型別定義的欄位完全不同（`location`、`latitude`、`longitude`、`postcode`、`ageRange`、`safetyRating`、`tags`；Review 甚至完全是不同的欄位設計）。

**教訓：如果前端已經先存在，應該先去看前端的型別定義（`types/content.ts`、`services/*.ts` 裡的 input type），再回頭設計後端 model，而不是後端自己憑空設計欄位，最後才發現要整個重改。**

改的時候：
- Model、Zod schema、ERD 文件（`docs/api-plan.md`）三個地方要一起同步更新
- 欄位改了之後，MongoDB 裡舊格式的測試資料要清掉（Atlas → Browse Collections → 刪除 collection 或個別資料），不然新舊格式混雜會造成資料解析錯誤

## 11. 前端串接：API Client

`frontend/src/services/apiClient.ts`：
```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function apiFetch(path: string, options: RequestInit = {}, token?: string) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json.data;
}
```

## 12. 前端串接：Adapter Pattern（後端資料格式 ≠ 前端顯示格式）

後端回傳的資料（`_id`、`latitude`/`longitude` 分開）跟前端顯示用的型別（`id`、`coordinates: [lat, lng]`、還需要 `image`/`gradient`/`rating` 等純顯示欄位）不一樣，不能直接把 API 回應塞給元件用，中間要寫一層轉換函式：

```ts
function toDisplayPlayground(raw: BackendPlayground): Playground {
  return {
    id: raw._id,
    coordinates: [raw.latitude, raw.longitude],
    image: FALLBACK_IMAGE, // 資料庫沒有的欄位，先給預設值
    gradient: FALLBACK_GRADIENT,
    rating: raw.safetyRating != null ? String(raw.safetyRating) : "N/A",
    // ...
  };
}
```

**這個 pattern 值得記住：後端 API 回傳的是「資料」，前端畫面需要的是「顯示用格式」，兩者未必一樣，中間用一個 adapter function 轉換，不要讓元件直接綁死 API 回傳格式。**

詳細頁需要巢狀資料（例如 playground + 它的 reviews）時，用 `Promise.all` 平行呼叫兩個 API 再合併：
```ts
const [raw, rawReviews] = await Promise.all([
  apiFetch(`/api/playgrounds/${id}`),
  apiFetch(`/api/playgrounds/${id}/reviews`),
]);
return { ...toDisplayPlayground(raw), reviews: rawReviews.map(toDisplayReview) };
```

## 13. 前端串接：表單送出時帶上 Clerk Token

`ReviewForm.tsx`：
```tsx
import { useAuth } from "@clerk/clerk-react";

const { getToken } = useAuth();

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  // ...驗證表單...
  const token = await getToken();
  if (!token) throw new Error("You must be logged in to submit a review.");
  await createReview({ ...formData, playgroundId: playground?.id }, token);
}
```

## 14. 除錯記錄：`Bounds are not valid`（地圖套件錯誤）

前端地圖元件（Leaflet）用 `playgrounds.map(p => p.coordinates)` 算所有座標的邊界，如果：
- 資料庫是空的（陣列長度 0）
- 或者 `coordinates` 欄位不存在（後端回傳的是分開的 `latitude`/`longitude`，前端元件卻直接讀不存在的 `coordinates`）

都會導致這個錯誤。排查方法：先看 Network 分頁確認 API 回傳是不是空陣列，再檢查欄位名稱是否對得上前端元件實際讀取的路徑。

## 15. 其他反覆出現的踩坑模式（跨越整個 Day 2）

- **忘記重啟 server**：改了 route 或 controller 但沒重啟（沒裝 nodemon），Postman 打出來的還是舊版本行為，容易誤判成別的 bug
- **Import 沒同步更新**：controller 新增了 function，routes 檔案的 import 大括號忘記加，`ReferenceError: xxx is not defined`
- **檔案內容整份貼錯／貼漏**：局部修改容易漏東西，遇到怪異的 `ReferenceError` 或 `does not provide an export` 時，直接整份檔案覆蓋重貼，比找哪一行漏改更快更保險
- **route 檔案職責分清楚**：不要把巢狀路由（`/api/playgrounds/:id/reviews`）跟獨立路由（`/api/reviews/:id`）的邏輯混進同一個 route 檔案，各自維護各自的資源

## Day 2 總結

- Clerk JWT 驗證、ownership check、資安 middleware（helmet/cors/rate-limit）、Zod validation、統一錯誤處理，全部完成並測試通過
- 後端欄位跟前端型別完整對齊（Playground + Review 都大改過一次）
- 前端服務層（`apiClient.ts`／`playgrounds.ts`／`reviews.ts`）串接完成，含 adapter 轉換層
- Review 新增與顯示、Ownership 顯示（Edit 按鈕依登入者判斷）皆驗證成功
- 最大心得：**先確認前端資料格式，再設計後端資料庫欄位**；遇到詭異錯誤先怀疑「檔案沒存到／server 沒重啟／import 沒同步」這幾個最常見原因

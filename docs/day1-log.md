# Day 1 操作紀錄（2026-09-21）

依照實際完成順序記錄，方便之後回顧或重做。

## 1. 建立 backend 專案骨架

在專案根目錄新增 `backend/` 資料夾，進去後初始化 npm：

```
cd backend
npm init -y
```

在 `backend/package.json` 加上 `"type": "module"`，才能用 `import/export` 語法。

安裝套件：
```
npm install express mongoose dotenv
```

資料夾結構：
```
backend/
├── src/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   └── config/
│       └── db.js
├── server.js
├── package.json
└── .env
```

## 2. 到 MongoDB Atlas 拿連線字串

1. 到 https://www.mongodb.com/cloud/atlas/register 註冊/登入
2. 建立免費 M0 cluster
3. Database Access：建立資料庫使用者帳號密碼（避免用含特殊符號的密碼，容易造成連線字串解析錯誤）
4. **Security → Network Access**：加入目前 IP，或開發階段用 `0.0.0.0/0` 允許所有 IP
5. Connect → Drivers → Node.js，複製 connection string
6. 把字串裡的 `<username>` `<password>` 換成真實帳密，並在路徑加上資料庫名稱

## 3. 設定 .env

`backend/.env`：
```
MONGODB_URI=mongodb+srv://實際帳號:實際密碼@cluster0.xxxxx.mongodb.net/spielspot?retryWrites=true&w=majority
PORT=5000
```

確認 `.gitignore` 有 `.env` 這行，避免密碼被 push 上 GitHub。

**踩過的坑：** 一開始 `.env` 裡的值留成 Atlas 給的 placeholder 文字（例如寫著「你的MongoDB連線字串」），沒有真的換成複製來的字串，導致 Mongoose 收到的是一段假文字而不是真實 URI。

## 4. 撰寫資料庫連線邏輯

`backend/src/config/db.js`：
```js
import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}
```

## 5. 撰寫 server.js 並啟動

`backend/server.js`：
```js
import "dotenv/config";   // 必須放最上面，否則 process.env 讀不到值
import express from "express";
import { connectDB } from "./src/config/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
```

`package.json` 加上：
```json
"scripts": {
  "start": "node server.js"
}
```

執行 `npm start`，看到以下兩行代表成功：
```
MongoDB connected
Server running on port 5000
```

**踩過的坑：**
- `dotenv/config` 沒放在最上面，導致 `process.env.MONGODB_URI` 讀到 `undefined`
- `.env` 檔案存成 UTF-8 with BOM（常見於 Windows 記事本存檔），造成變數名稱前面多了看不見的字元，讀不到值。改用 VS Code 存成不含 BOM 的 UTF-8 解決

## 6. Playground Model

`backend/src/models/Playground.js`：
```js
import mongoose from "mongoose";

const playgroundSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    category: { type: String },
    images: { type: [String], default: [] },
    ownerId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Playground", playgroundSchema);
```

## 7. Playground Controller

`backend/src/controllers/playgroundController.js`：
```js
import Playground from "../models/Playground.js";

export async function getPlaygrounds(req, res) {
  try {
    const playgrounds = await Playground.find();
    res.json({ success: true, data: playgrounds });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPlaygroundById(req, res) {
  try {
    const playground = await Playground.findById(req.params.id);
    if (!playground) {
      return res.status(404).json({ success: false, error: "Playground not found" });
    }
    res.json({ success: true, data: playground });
  } catch (err) {
    res.status(400).json({ success: false, error: "Invalid id" });
  }
}

export async function createPlayground(req, res) {
  try {
    const playground = await Playground.create(req.body);
    res.status(201).json({ success: true, data: playground });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
```

## 8. Review Model

`backend/src/models/Review.js`：
```js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    playgroundId: { type: mongoose.Schema.Types.ObjectId, ref: "Playground", required: true },
    authorId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
```

## 9. Review Controller

`backend/src/controllers/reviewController.js`：
```js
import Review from "../models/Review.js";

export async function getReviewsForPlayground(req, res) {
  try {
    const reviews = await Review.find({ playgroundId: req.params.id });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(400).json({ success: false, error: "Invalid playground id" });
  }
}

export async function createReview(req, res) {
  try {
    const review = await Review.create({ ...req.body, playgroundId: req.params.id });
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
```

## 10. Routes

`backend/src/routes/playgroundRoutes.js`：
```js
import express from "express";
import {
  getPlaygrounds,
  getPlaygroundById,
  createPlayground,
} from "../controllers/playgroundController.js";
import {
  getReviewsForPlayground,
  createReview,
} from "../controllers/reviewController.js";

const router = express.Router();

// PLAYGROUND ROUTES
router.get("/", getPlaygrounds);
router.get("/:id", getPlaygroundById);
router.post("/", createPlayground);

// REVIEW ROUTES
router.get("/:id/reviews", getReviewsForPlayground);
router.post("/:id/reviews", createReview);

export default router;
```

**踩過的坑：** import 那行只寫了部分 function（例如漏了 `getPlaygroundById`），導致 `ReferenceError: getPlaygroundById is not defined`。修法：確認 controller 裡每個要用到的 function 前面都有 `export`，且 route 檔案 import 時大括號裡有列全。

## 11. 接進 server.js

在 `server.js` 補上：
```js
import playgroundRoutes from "./src/routes/playgroundRoutes.js";
app.use("/api/playgrounds", playgroundRoutes);
```

## 12. Postman 測試（依序）

1. `GET /api/playgrounds` → 回傳空陣列
2. `POST /api/playgrounds`（帶 name/address/lat/lng/ownerId 等欄位）→ 201，回傳含 `_id`
3. `GET /api/playgrounds` → 確認剛剛的資料出現
4. `GET /api/playgrounds/:id`（用上一步的真實 `_id`，不是文字佔位符）→ 回傳單筆資料
5. `POST /api/playgrounds/:id/reviews`（帶 authorId/rating/comment）→ 201
6. `GET /api/playgrounds/:id/reviews` → 確認評論出現

**踩過的坑：** 測試 POST review 時把網址裡的 `{那個_id}` 佔位符原封不動貼上去，沒換成真實 ObjectId，造成 404。另外新增路由後忘記重啟 server（沒裝 nodemon 不會自動重載），也會導致 404。

## 今日結論

- Playground / Review 兩個 entity 的 CRUD 骨架＋關聯查詢全部測試通過
- 遇到的問題主要集中在環境設定（`.env` 沒填對值、BOM、import 順序、忘記重啟 server），而不是核心邏輯
- 尚未開始：Clerk JWT 驗證、PATCH/DELETE、安全性 middleware（Day 2 待辦）

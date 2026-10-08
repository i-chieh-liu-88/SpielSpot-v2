import express from "express";
import { clerkMiddleware } from "@clerk/express";
import playgroundRoutes from "./routes/playgroundRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
//處理資安 middleware
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.NODE_ENV === "production"
    ? []
    : ["http://localhost:5173", "http://localhost:4173"]),
].filter(Boolean);

//處理資安 middleware---------------------------------
app.use(helmet());

app.use(
  cors({
    origin: allowedOrigins,
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 100, // 每個IP最多100次請求
  message: {
    success: false,
    error: "Too many requests, please try again later.",
  },
});
app.use(limiter);
//（放在 express.json() 之前）---------------------------------

app.use(express.json()); // 讓 Express 看得懂 JSON body，這行不能漏
app.use(clerkMiddleware()); // 讓每個 request 都能讀到登入狀態
//clerkMiddleware() 本身不會擋掉任何請求，它只是幫每個 request 加上 req.auth，之後在需要保護的 route 上用 requireAuth() 才會真的擋。

/* ------------------------------- 讓根路徑看起來更友善 ------------------------------ */
app.get("/", (req, res) => {
  res.json({
    status: "SpielSpot backend is running",
    docs: "/api/playgrounds",
  });
});
/* ------------------------------- 讓根路徑看起來更友善 ------------------------------ */
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
  });
});

app.use("/api/playgrounds", playgroundRoutes);
app.use("/api/reviews", reviewRoutes);

// 放在所有路由後面 (Express 會由上往下尋找路由；前面都沒有符合的路徑，才會走到這個 404 處理)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

//統一錯誤處理 middleware
app.use(errorHandler);

export default app; // 只匯出 app，不啟動 server，測試才能直接拿去用

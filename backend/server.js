import "dotenv/config";
import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { connectDB } from "./src/config/db.js";
import playgroundRoutes from "./src/routes/playgroundRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
//處理資安 middleware
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import { errorHandler } from "./src/middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

//處理資安 middleware---------------------------------
app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173", // 你前端跑的網址，正式上線後換成真實網域
  }),
); //只白名單開放你前端的網址，不要為了方便寫 origin: "*"（開放所有來源），不然任何網站都能呼叫你的 API，失去 CORS 保護的意義。

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

app.use("/api/playgrounds", playgroundRoutes);
app.use("/api/reviews", reviewRoutes);

//統一錯誤處理 middleware
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

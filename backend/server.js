import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import PhotoCleanup from "./src/models/PhotoCleanup.js";
import { startPhotoCleanupWorker } from "./src/services/photoCleanup.js";

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await PhotoCleanup.init();
  startPhotoCleanupWorker();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

//dotenv/config 只留在 server.js，所以測試載入 app.js 時不會去讀你的 .env。
// 測試不依賴真實的密鑰和資料庫連線字串，這是我們希望的行為。

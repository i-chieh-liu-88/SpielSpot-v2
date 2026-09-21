import "dotenv/config";
import express from "express";
import { connectDB } from "./src/config/db.js";
import playgroundRoutes from "./src/routes/playgroundRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // 讓 Express 看得懂 JSON body，這行不能漏
app.use("/api/playgrounds", playgroundRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

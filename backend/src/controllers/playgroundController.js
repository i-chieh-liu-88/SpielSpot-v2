import { getAuth } from "@clerk/express";
import Playground from "../models/Playground.js";

/* ----------------------------------- GET ---------------------------------- */
/* ----------------------------------- GET ---------------------------------- */
export async function getPlaygrounds(req, res, next) {
  try {
    const { location, ageRange, tags } = req.query;
    const filter = {};

    if (location) {
      filter.location = { $regex: location, $options: "i" }; // 不分大小寫、部分比對
    }
    if (ageRange) {
      filter.ageRange = ageRange; // 精確比對
    }
    if (tags) {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagList.length > 0) {
        filter.tags = { $in: tagList }; // 符合任一個 tag 就算
      }
    }

    const playgrounds = await Playground.find(filter);
    res.json({ success: true, data: playgrounds });
  } catch (err) {
    next(err);
  }
}

/* -------------------------------- GET by ID ------------------------------- */
/* -------------------------------- GET by ID ------------------------------- */

export async function getPlaygroundById(req, res) {
  try {
    const playground = await Playground.findById(req.params.id);
    if (!playground) {
      return res
        .status(404)
        .json({ success: false, error: "Playground not found" });
    }
    res.json({ success: true, data: playground });
  } catch (err) {
    res.status(400).json({ success: false, error: "Invalid id" });
  }
}

/* ---------------------------------- POST ---------------------------------- */
/* ---------------------------------- POST ---------------------------------- */
export async function createPlayground(req, res, next) {
  try {
    const { userId } = getAuth(req);
    const playground = await Playground.create({
      ...req.body,
      ownerId: userId,
    });
    res.status(201).json({ success: true, data: playground });
  } catch (err) {
    next(err);
  }
}
//重點：ownerId: userId 放在 ...req.body 後面，這樣就算前端在 body 裡故意傳了 ownerId: "別人的id"，也會被後面這個真正的 userId 蓋掉，不會被冒用。

/* ------------------------- PATCH+ ownership check ------------------------- */
/* ------------------------- PATCH+ ownership check ------------------------- */
export async function updatePlayground(req, res, next) {
  try {
    const { userId } = getAuth(req);
    const playground = await Playground.findById(req.params.id);

    if (!playground) {
      return res
        .status(404)
        .json({ success: false, error: "Playground not found" });
    }
    if (playground.ownerId !== userId) {
      return res
        .status(403)
        .json({ success: false, error: "Not allowed to edit this playground" });
    }

    Object.assign(playground, req.body);
    playground.ownerId = playground.ownerId; // 不允許透過 body 改 ownerId
    await playground.save();

    res.json({ success: true, data: playground });
  } catch (err) {
    next(err);
  }
}

/* ------------------------- DELETE+ ownership check ------------------------ */
/* ------------------------- DELETE+ ownership check ------------------------ */
export async function deletePlayground(req, res, next) {
  try {
    const { userId } = getAuth(req);
    const playground = await Playground.findById(req.params.id);

    if (!playground) {
      return res
        .status(404)
        .json({ success: false, error: "Playground not found" });
    }
    if (playground.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not allowed to delete this playground",
      });
    }

    await playground.deleteOne();
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}

//重點：先查出資料、比對 ownerId 是不是本人，才准許動作。403（Forbidden）代表「有登入但沒權限」，跟 401（Unauthorized，根本沒登入）意義不同

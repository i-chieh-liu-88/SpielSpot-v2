import { getAuth } from "@clerk/express";
import Playground from "../models/Playground.js";

//GET
export async function getPlaygrounds(req, res) {
  try {
    const playgrounds = await Playground.find();
    res.json({ success: true, data: playgrounds });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

//GET by ID
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

//POST
export async function createPlayground(req, res) {
  try {
    const { userId } = getAuth(req);
    const playground = await Playground.create({
      ...req.body,
      ownerId: userId,
    });
    res.status(201).json({ success: true, data: playground });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
//重點：ownerId: userId 放在 ...req.body 後面，這樣就算前端在 body 裡故意傳了 ownerId: "別人的id"，也會被後面這個真正的 userId 蓋掉，不會被冒用。

//PATCH+ ownership check
export async function updatePlayground(req, res) {
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
    res.status(400).json({ success: false, error: err.message });
  }
}

//DELETE+ ownership check
export async function deletePlayground(req, res) {
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
    res.status(400).json({ success: false, error: err.message });
  }
}

//重點：先查出資料、比對 ownerId 是不是本人，才准許動作。403（Forbidden）代表「有登入但沒權限」，跟 401（Unauthorized，根本沒登入）意義不同

import { runRelationshipTransaction, lockPlayground, relationshipError } from "../services/relationshipTransaction.js";
import { getAuth } from "@clerk/express";
import Playground from "../models/Playground.js";
import Review from "../models/Review.js";
import { queuePhotoCleanup } from "../services/photoCleanup.js";

/* ----------------------------------- GET ---------------------------------- */
/* ----------------------------------- GET ---------------------------------- */
export async function getPlaygrounds(req, res, next) {
  try {
    const { location, ageRange, tags } = req.validatedQuery ?? req.query;
    const filter = {};

    if (location) {
      // 保留不分大小寫的部分比對，但把正規表示式符號當一般文字。
      filter.location = { $regex: location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
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
    await runRelationshipTransaction(async () => {
      const playground = await Playground.findById(req.params.id, "+imagePublicId +imagePublicIds");
      if (!playground) throw relationshipError(404, "Playground not found");
      if (playground.ownerId !== userId) throw relationshipError(403, "Not allowed to delete this playground");
      // Both review creation and deletion write the same parent before proceeding.
      await lockPlayground(req.params.id);
      if (await Review.exists({ playgroundId: playground._id })) {
        throw relationshipError(409, "Cannot delete a playground with reviews");
      }
      await queuePhotoCleanup([...(playground.imagePublicIds ?? []), playground.imagePublicId]);
      await playground.deleteOne();
    });
    // The worker sees cleanup jobs only after the deletion transaction commits.
    res.json({ success: true, data: null });
  } catch (err) {
    if (err.relationship) return res.status(err.status).json({ success: false, error: err.message });
    next(err);
  }
}

//重點：先查出資料、比對 ownerId 是不是本人，才准許動作。403（Forbidden）代表「有登入但沒權限」，跟 401（Unauthorized，根本沒登入）意義不同

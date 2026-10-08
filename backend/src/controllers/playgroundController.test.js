import { jest } from "@jest/globals"; //因為專案是 ESM（"type": "module"），Jest 的全域變數機制沒辦法完全套用，所以要手動 import 進來。

/* ---------------------------------- MOCK ---------------------------------- */
jest.unstable_mockModule("../models/Playground.js", () => ({
  default: {
    find: jest.fn(),
    findById: jest.fn(), // updatePlayground 會用到，之前漏掉了
  },
}));

jest.unstable_mockModule("@clerk/express", () => ({
  getAuth: jest.fn(),
}));
// 兩個 mock 都要在任何 import controller 之前設定好
//為什麼要 mock 掉它：這樣測試的時候根本不會真的連 MongoDB，速度快、也不會因為資料庫沒開而測試失敗，這正是課程強調的「unit test 不該碰真實資料庫」。

// 動態 import：因為用了 unstable_mockModule，controller 要在 mock 設定好之後才 import
const { getPlaygrounds, updatePlayground } =
  await import("./playgroundController.js");
const Playground = (await import("../models/Playground.js")).default;
const { getAuth } = await import("@clerk/express");
//為什麼不能寫成一般的 import：一般的 import 語法會在檔案「一開始」就先載入，這樣會搶在上面 unstable_mockModule 設定好之前，就先載入了真正的 Playground.js，mock 就沒生效。用 await import(...) 可以確保「先設定好 mock，才真正載入 controller」，順序才會對。

//With describe(), you group related tests.
describe("getPlaygrounds", () => {
  let req;
  let res;

  //beforeEach 代表「每一個測試開始前都先執行這段」，確保每個測試都是從乾淨的狀態開始，不會互相污染。
  beforeEach(() => {
    req = { query: {} }; //有 req.query = {} 當預設值（不然 req.query 會是 undefined，解構賦值會報錯）
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(), //單純一個假函式，之後可以檢查它有沒有被呼叫、被傳了什麼參數
    };
  });

  //名字要描述行為 (應該發生什麼)
  test("returns 200-style success response with playgrounds", async () => {
    const fakePlaygrounds = [{ name: "Test Playground" }]; //準備一筆假資料
    Playground.find.mockResolvedValue(fakePlaygrounds);

    await getPlaygrounds(req, res);

    expect(Playground.find).toHaveBeenCalled(); //確認 Playground.find 真的有被呼叫過（確保 controller 真的有去查資料，不是邏輯壞了直接跳過）
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: fakePlaygrounds,
    });
  });

  //測試錯誤情況
  test("passes database errors to the error handler", async () => {
    const databaseError = new Error("DB connection failed");
    const next = jest.fn();
    Playground.find.mockRejectedValue(databaseError);

    await getPlaygrounds(req, res, next);

    expect(next).toHaveBeenCalledWith(databaseError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  //驗證 filter 邏輯本身
  test("applies location filter from query string", async () => {
    Playground.find.mockResolvedValue([]);
    req.query = { location: "Essen" };

    await getPlaygrounds(req, res);

    expect(Playground.find).toHaveBeenCalledWith(
      expect.objectContaining({
        location: { $regex: "Essen", $options: "i" },
      }),
    );
  });
});

/* -------------------------- 測 ownership check 的邏輯 ------------------------- */

describe("updatePlayground", () => {
  let req;
  let res;

  beforeEach(() => {
    req = { params: { id: "playground-123" }, body: { name: "New Name" } };
    //因為 controller 裡用到 req.params.id 去查資料，之前 getPlaygrounds 完全沒用到 req 的任何內容，這次要模擬「網址帶的 id 是什麼」
    //body: { name: "New Name" }：模擬「使用者想更新成什麼內容」，對應 PATCH 請求的 body
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  /* --------------------------------- 404 情況 --------------------------------- */
  test("returns 404 when playground does not exist", async () => {
    getAuth.mockReturnValue({ userId: "user-abc" });
    //這次用 mockReturnValue，因為真正的 getAuth(req) 在程式碼裡是 const { userId } = getAuth(req)，
    // 沒有 await，代表它是同步函式，直接回傳結果，不是回傳一個 Promise。同步用 mockReturnValue，非同步
    // （回傳 Promise）用 mockResolvedValue，這是兩者的關鍵差異
    Playground.findById.mockResolvedValue(null);
    //假裝資料庫查詢完成，但查不到東西（回傳 null），這是為了模擬「這個 id 根本不存在」的情境

    //Act：呼叫 updatePlayground(req, res)
    await updatePlayground(req, res);

    //Assert：檢查 controller 是不是真的照著程式碼裡 if (!playground) { return res.status(404)... }
    // 這條分支走，回傳了 404 跟正確的錯誤訊息
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Playground not found",
    });
  });
  //這個測試在驗證什麼：當資料庫說「這筆資料不存在」時，controller 有沒有正確擋下來、回傳 404，
  // 而不是繼續往下執行、可能導致更奇怪的錯誤。

  /* --------------------------------- 403 情況 --------------------------------- */
  test("returns 403 when the logged-in user is not the owner", async () => {
    getAuth.mockReturnValue({ userId: "user-not-owner" }); //假裝「登入的人是 user-not-owner」

    //mockResolvedValue() 的作用是模擬非同步查詢成功
    Playground.findById.mockResolvedValue({
      ownerId: "user-real-owner",
      save: jest.fn(),
    });
    //這次資料庫有找到資料，但這筆資料的主人（ownerId）是另一個人 user-real-owner，
    // 跟目前登入的人（user-not-owner）不是同一個

    //雖然這個測試案例裡 save() 根本不會被呼叫到（因為在檢查 ownership 那步就被擋下來了），
    // 但保留這個欄位是為了讓假資料的「形狀」跟真實的 Mongoose 文件一致，是一個穩妥的寫法習慣，
    // 避免萬一之後程式邏輯改了、真的呼叫到 .save() 卻找不到這個方法而噴錯。

    await updatePlayground(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Not allowed to edit this playground",
    });
  });
  //這個測試在驗證什麼：不是自己的資料，就算網址帶著這筆資料的合法 id、也有登入，
  // 還是應該被擋下來，回 403（不是隨便就能改別人的東西）。

  // 呼叫 updatePlayground()
  //         ↓
  // 等待 Playground.findById()
  //         ↓
  // 取得假的 playground
  //         ↓
  // 比對 ownerId 和 userId
  //         ↓
  // 呼叫 res.status(403).json(...)
  //         ↓
  // 回到測試繼續執行 expect

  //   這裡三個非同步語法的關係是：
  // - async：表示這個測試函式可以使用 await。
  // - mockResolvedValue()：建立一個成功完成的假 Promise。
  //Promise 是 JavaScript 用來表示「某件非同步工作未來會完成，並回傳結果」的物件。
  // - await：等 controller 完整處理完，再執行斷言。

  /* ---------------------------------- 成功情況 --------------------------------- */
  test("updates and returns 200 when the logged-in user is the owner", async () => {
    // ===== Arrange（準備）=====
    //先把假資料存成一個獨立的變數
    const fakePlayground = {
      ownerId: "user-real-owner",
      name: "Old Name",
      save: jest.fn().mockResolvedValue(true), //save: jest.fn().mockResolvedValue(true)：這裡是新技巧，
      //   把 jest.fn()（假函式）跟 mockResolvedValue(true)（設定它的回傳值）串在一起寫，
      //   等同於「建立一個假函式，並且順便告訴它：只要被呼叫，就回傳一個成功 resolve 的 Promise」。
      //   這樣程式碼裡的 await playground.save() 才能正常執行完畢
    };
    getAuth.mockReturnValue({ userId: "user-real-owner" });
    Playground.findById.mockResolvedValue(fakePlayground);

    // ===== Act（執行）===== (檢查結果符不符合預期)
    await updatePlayground(req, res);

    // ===== Assert（驗證）=====
    expect(fakePlayground.save).toHaveBeenCalled(); //確認 controller 真的有呼叫 .save()（代表真的想把改動存進資料庫）
    expect(fakePlayground.name).toBe("New Name"); // Object.assign 真的把 body 蓋進去了
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: fakePlayground,
    });
  });
});

//這三個測試合起來，完整覆蓋了 ownership check 這個資安邏輯的三種可能結果：
// 查無此資料、有資料但不是本人、有資料且是本人。

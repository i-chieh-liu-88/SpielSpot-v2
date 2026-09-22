export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return res
        .status(400)
        .json({ success: false, error: firstError.message });
    }
    req.body = result.data; // 用驗證過、清理過的資料取代原本的 body
    next();
  };
}

//寫成這種「接受 schema、回傳 middleware」的形式，之後任何 route 想加驗證，只要傳不同 schema 進去就能重複使用，不用每個 entity 各寫一次判斷邏輯。

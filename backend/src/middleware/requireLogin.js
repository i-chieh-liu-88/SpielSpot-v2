import { getAuth } from "@clerk/express";

export function requireLogin(req, res, next) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ success: false, error: "Please login" });
  }

  next();
}

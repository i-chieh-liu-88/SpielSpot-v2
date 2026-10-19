import { Router } from "express";
import { isIP } from "node:net";
import { requireLogin } from "../middleware/requireLogin.js";

export const proxyDiagnostics = Router();
// Off unless explicitly enabled. Keep this behind the existing global limiter.
proxyDiagnostics.get("/", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  if (process.env.PROXY_DIAGNOSTICS_ENABLED !== "true") {
    return res.status(404).json({ success: false, error: "Route not found" });
  }
  next();
}, requireLogin, (req, res) => {
  const header = req.get("x-forwarded-for");
  const entries = header ? header.split(",").map(value => value.trim()) : [];
  const expectedIP = req.get("x-diagnostic-client-ip");
  if (expectedIP && !isIP(expectedIP)) {
    return res.status(400).json({ success: false, error: "Invalid diagnostic IP format" });
  }
  // A known public IP is compared in memory only; never echo or log it.
  const matches = expectedIP ? entries.map((value, index) => value === expectedIP ? entries.length - index : null).filter(value => value !== null) : [];
  // Return structure only. Never echo addresses, tokens, hostnames or headers.
  res.json({ success: true, data: {
    trustedProxyHops: req.app.get("trust proxy") || 0,
    forwardedForPresent: Boolean(header),
    forwardedForEntries: entries.length,
    allEntriesAreIPs: entries.length > 0 && entries.every(value => isIP(value) !== 0),
    forwardedHeaderPresent: Boolean(req.get("forwarded")),
    matchingHopsFromApp: matches,
  } });
});

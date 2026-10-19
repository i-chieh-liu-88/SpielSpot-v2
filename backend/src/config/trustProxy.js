// Keep direct local requests untrusted. Never accept "true" (trust every hop).
export function configureTrustProxy(app, value = process.env.TRUST_PROXY_HOPS) {
  const raw = value?.trim() ?? "";
  if (raw && !/^[0-5]$/.test(raw)) {
    throw new Error("TRUST_PROXY_HOPS must be an integer from 0 to 5.");
  }
  const hops = raw ? Number(raw) : 0;
  app.set("trust proxy", hops === 0 ? false : hops);
  return hops;
}

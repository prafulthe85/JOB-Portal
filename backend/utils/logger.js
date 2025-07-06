export const logger = {
  info: (msg, data) => console.log("[INFO]", msg, data || ""),
  warn: (msg, data) => console.warn("[WARN]", msg, data || ""),
  error: (msg, data) => console.error("[ERROR]", msg, data || ""),
};

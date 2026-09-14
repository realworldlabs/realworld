export type Level = "info" | "warn" | "error";

export interface Logger {
  log(level: Level, message: string, data?: Record<string, unknown>): void;
}

/** Logs JSON lines to stdout and forwards warnings and errors to a Slack/Discord-compatible webhook. */
export function createLogger(webhook?: string, fetcher: typeof fetch = fetch): Logger {
  return {
    log(level, message, data) {
      const line = { t: new Date().toISOString(), level, message, ...data };
      console.log(JSON.stringify(line, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));
      if (webhook && level !== "info") {
        const text = `[keeper ${level}] ${message}${data ? " " + JSON.stringify(data, (_k, v) => (typeof v === "bigint" ? v.toString() : v)) : ""}`;
        fetcher(webhook, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text, content: text }),
        }).catch((e) => console.error("webhook failed", e));
      }
    },
  };
}

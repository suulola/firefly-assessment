interface LogFields {
  [key: string]: unknown;
}

type LogLevel = "info" | "warn" | "error";

function shouldLog() {
  return process.env.NODE_ENV !== "test" && process.env.VITEST !== "true";
}

function writeLog(level: LogLevel, message: string, fields: LogFields = {}) {
  if (!shouldLog()) return;
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...fields,
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }
  console.log(line);
}

export const logger = {
  info: (message: string, fields?: LogFields) => writeLog("info", message, fields),
  warn: (message: string, fields?: LogFields) => writeLog("warn", message, fields),
  error: (message: string, fields?: LogFields) => writeLog("error", message, fields),
};

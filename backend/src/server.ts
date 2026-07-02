import { app } from "@/app.js";
import { loadConfig } from "@/config.js";
import { logger } from "@/logger.js";

const config = loadConfig();

const server = app.listen(config.port, () => {
  logger.info("server_started", { port: config.port });
});

function shutdown(signal: "SIGTERM" | "SIGINT") {
  logger.info("server_shutdown_started", { signal });
  server.close((error) => {
    if (error) {
      logger.error("server_shutdown_failed", { signal, error: error.message });
      process.exit(1);
    }
    logger.info("server_shutdown_complete", { signal });
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

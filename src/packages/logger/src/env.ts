import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

import "dotenv/config";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["PROD", "DEV", "TEST"]).optional().default("DEV"),
    LOG_LEVEL: z
      .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
      .optional()
      .default("info"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

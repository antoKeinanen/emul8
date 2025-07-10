import type { StringValue } from "ms";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

import "dotenv/config";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["PROD", "DEV", "TEST"]).optional().default("DEV"),
    DATABASE_URL: z.url(),
    JWT_ACCESS_TOKEN_SECRET: z.string(),
    JWT_ACCESS_TOKEN_EXPIRY: z
      .string()
      .optional()
      .default("15m")
      .transform((v) => v as StringValue),
    JWT_REFRESH_TOKEN_SECRET: z.string(),
    JWT_REFRESH_TOKEN_EXPIRY: z
      .string()
      .optional()
      .default("7d")
      .transform((v) => v as StringValue),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

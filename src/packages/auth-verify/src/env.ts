import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

import "dotenv/config";

export const env = createEnv({
  server: {
    JWT_ACCESS_TOKEN_SECRET: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

import "dotenv/config";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";

import { tryCatch } from "./lib/tryCatch";
import { tokenService } from "./service/token.service";

export function createContext({ req, res }: CreateHTTPContextOptions) {
  let user_id: string | null = null;

  const accessToken = req.headers.authorization?.split(" ")[1];
  if (accessToken) {
    const [payload, _] = tryCatch(() => tokenService.verifyAccess(accessToken));
    if (payload) {
      user_id = payload.user_id;
    }
  }

  return { req, res, user_id };
}

export type Context = ReturnType<typeof createContext>;

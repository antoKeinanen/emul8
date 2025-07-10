import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const authedMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user_id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({ ctx: { ...ctx, user_id: ctx.user_id } });
});

const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;
  if (result.ok) {
    console.info("OK request timing:", { path, type, durationMs });
  } else {
    console.error("Non-OK request timing", { path, type, durationMs });
  }
  return result;
});

export const router = t.router;
export const publicProcedure = t.procedure.use(loggerMiddleware);
export const protectedProcedure = publicProcedure.use(authedMiddleware);
export { createContext } from "./context";

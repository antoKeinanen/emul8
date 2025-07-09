import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { z } from "zod/v4";

import { publicProcedure, router } from "./trpc";

const authRouter = router({
  getHello: publicProcedure.input(z.object({ name: z.string() })).query(() => {
    return "Hello, world";
  }),
});

const server = createHTTPServer({
  router: authRouter,
});

server.listen(3000);
console.log("Listening on port 3000");

export type AuthRouter = typeof authRouter;

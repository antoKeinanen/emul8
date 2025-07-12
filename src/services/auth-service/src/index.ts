import { createContext, router } from "@emul8/trpc-server";
import { createHTTPServer } from "@trpc/server/adapters/standalone";

import { authRouter as authRouterRouter } from "./routers/auth.router";

const authRouter = router({
  auth: authRouterRouter,
});

const server = createHTTPServer({
  router: authRouter,
  basePath: "/api/auth/",
  createContext,
});

server.listen(3000);
console.log("Listening on port 3000");

export type AuthRouter = typeof authRouter;

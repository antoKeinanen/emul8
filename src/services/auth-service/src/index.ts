import { createHTTPServer } from "@trpc/server/adapters/standalone";

import { createContext } from "./context";
import { authRouter as authRouterRouter } from "./routers/auth.router";
import { router } from "./trpc";

const authRouter = router({
  auth: authRouterRouter,
});

const server = createHTTPServer({
  router: authRouter,
  createContext,
});

server.listen(3000);
console.log("Listening on port 3000");

export type AuthRouter = typeof authRouter;

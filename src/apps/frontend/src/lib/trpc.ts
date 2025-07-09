import { createTRPCReact } from "@trpc/react-query";
import type { AuthRouter } from "@emul8/auth-service";

export const trpc = createTRPCReact<AuthRouter>();

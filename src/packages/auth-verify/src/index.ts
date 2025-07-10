import jwt from "jsonwebtoken";

import { env } from "./env";

export interface TokenPayload {
  user_id: string;
}

export function verifyAccess(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_TOKEN_SECRET, {
    algorithms: ["HS256"],
  }) as TokenPayload;
}

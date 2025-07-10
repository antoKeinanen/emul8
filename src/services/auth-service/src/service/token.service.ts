import type { TokenPayload } from "@emul8/auth-verify";
import type { Result } from "@emul8/types";
import { verifyAccess } from "@emul8/auth-verify";
import { tryCatch } from "@emul8/util";
import jwt from "jsonwebtoken";

import { env } from "../env";
import { authRepository } from "../repository/auth.repository";

function createAccess(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_ACCESS_TOKEN_EXPIRY,
  });
}

function createRefresh(payload: TokenPayload) {
  const token = jwt.sign(payload, env.JWT_REFRESH_TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_REFRESH_TOKEN_EXPIRY,
  });
  const { exp } = jwt.decode(token) as { exp: number };

  return { token, expiresAt: new Date(exp * 1000) };
}

async function verifyRefresh(
  token: string,
): Promise<Result<TokenPayload, string>> {
  const [payload, payloadError] = tryCatch(
    () =>
      jwt.verify(token, env.JWT_REFRESH_TOKEN_SECRET, {
        algorithms: ["HS256"],
      }) as TokenPayload,
  );

  if (payloadError != null || !payload) {
    return [null, "Invalid or expired token"];
  }

  const [dbToken, tokenError] = await authRepository.getRefreshToken(
    payload.user_id,
  );
  if (
    tokenError ||
    !dbToken?.refresh_token ||
    !dbToken.refresh_expires ||
    new Date() > dbToken.refresh_expires
  ) {
    return [null, "Invalid or expired token"];
  }

  return [payload, null];
}

export const tokenService = {
  createAccess,
  createRefresh,
  verifyAccess,
  verifyRefresh,
};

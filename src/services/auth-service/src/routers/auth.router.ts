import type { IncomingMessage, ServerResponse } from "http";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "@emul8/trpc-server";
import { TRPCError } from "@trpc/server";
import argon2 from "@node-rs/argon2";
import cookie from "cookie";
import { z } from "zod/v4";

import { env } from "../env";
import { authRepository } from "../repository/auth.repository";
import { tokenService } from "../service/token.service";

function setRefreshTokenCookie(
  res: ServerResponse<IncomingMessage>,
  refreshToken: string,
  refreshExpires: Date,
) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("jdt", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV == "PROD",
      expires: refreshExpires,
    }),
  );
}

export const authRouter = router({
  signUp: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { username, password } = input;
      const passwordHash = await argon2.hash(password);

      const [user, userError] = await authRepository.createUser(
        username,
        passwordHash,
      );
      if (userError != null) {
        throw new TRPCError({ code: "BAD_REQUEST", message: userError });
      }

      const { user_id } = user;

      const accessToken = tokenService.createAccess({ user_id });
      const { token: refreshToken, expiresAt: refreshExpires } =
        tokenService.createRefresh({ user_id });

      const [_, refreshTokenError] = await authRepository.setRefreshToken(
        user_id,
        refreshToken,
        refreshExpires,
      );
      if (refreshTokenError != null) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: refreshTokenError,
        });
      }

      setRefreshTokenCookie(ctx.res, refreshToken, refreshExpires);

      return { accessToken };
    }),

  signIn: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { username, password } = input;
      const [user, userError] =
        await authRepository.getUserByUsername(username);

      if (userError != null) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: userError,
        });
      }
      if (user == null) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username and/or password",
        });
      }
      if (!(await argon2.verify(user.password_hash, password))) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username and/or password",
        });
      }

      let { refresh_token, refresh_expires } = user;
      if (!refresh_token || !refresh_expires) {
        const { token: newRefreshToken, expiresAt: newRefreshExpires } =
          tokenService.createRefresh({ user_id: user.user_id });

        const [_, refreshTokenError] = await authRepository.setRefreshToken(
          user.user_id,
          newRefreshToken,
          newRefreshExpires,
        );
        if (refreshTokenError != null) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: refreshTokenError,
          });
        }

        refresh_token = newRefreshToken;
        refresh_expires = newRefreshExpires;
      }

      const accessToken = tokenService.createAccess({ user_id: user.user_id });

      setRefreshTokenCookie(ctx.res, refresh_token, refresh_expires);

      return { accessToken };
    }),

  refresh: publicProcedure.mutation(async ({ ctx }) => {
    const cookies = cookie.parse(ctx.req.headers.cookie ?? "");

    const oldRefresh: string | undefined = cookies.jdt;
    if (!oldRefresh) {
      console.error("Failed to refresh tokens: no refresh token provided");
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const [payload, payloadError] =
      await tokenService.verifyRefresh(oldRefresh);

    if (payloadError != null) {
      console.log(oldRefresh);
      console.error("Failed to refresh tokens: invalid refresh token");
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    await authRepository.invalidateRefreshToken(payload.user_id);

    const newAccessToken = tokenService.createAccess({
      user_id: payload.user_id,
    });
    const { token: newRefreshToken, expiresAt: newRefreshExpires } =
      tokenService.createRefresh({ user_id: payload.user_id });

    const [_, refreshTokenError] = await authRepository.setRefreshToken(
      payload.user_id,
      newRefreshToken,
      newRefreshExpires,
    );
    if (refreshTokenError != null) {
      console.error("Failed to refresh tokens:", refreshTokenError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: refreshTokenError,
      });
    }

    setRefreshTokenCookie(ctx.res, newRefreshToken, newRefreshExpires);

    return { accessToken: newAccessToken };
  }),

  logout: publicProcedure.mutation(({ ctx }) => {
    setRefreshTokenCookie(ctx.res, "", new Date(0));

    return { success: true };
  }),

  debug: protectedProcedure.query(() => "Logged in"),
});

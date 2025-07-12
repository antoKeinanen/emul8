import type { RefreshToken, Result, User } from "@emul8/types";
import { refreshTokenSchema, userSchema } from "@emul8/types";
import { z } from "zod/v4";

import { db } from "../lib/db";
import logger from "../lib/logger";

async function createUser(
  username: string,
  password_hash: string,
): Promise<Result<User, string>> {
  const sql = `
  INSERT INTO EMUL8.USERS (USERNAME, PASSWORD_HASH)
  VALUES ($1, $2)
  RETURNING USER_ID, USERNAME, PASSWORD_HASH, REFRESH_TOKEN, REFRESH_EXPIRES;`;

  const [user, error] = await db.execute(sql, [username, password_hash]);

  if (error != null) {
    if (error == "unique_violation") {
      return [null, "Username already taken"];
    }
    return [null, "Unexpected error has occurred, try again later"];
  }

  const schema = z.array(userSchema);
  const validatedUser = schema.safeParse(user.rows);
  if (!validatedUser.success || !validatedUser.data[0]) {
    logger.error("Failed to create user:", validatedUser.error);
    return [null, "Unexpected error has occurred, try again later"];
  }

  return [validatedUser.data[0], null];
}

async function getRefreshToken(
  user_id: string,
): Promise<Result<RefreshToken | null, string>> {
  const sql = `
  SELECT REFRESH_TOKEN, REFRESH_EXPIRES
  FROM EMUL8.USERS
  WHERE USER_ID = $1;`;

  const [token, error] = await db.execute(sql, [user_id]);

  if (error != null) {
    return [null, "Unexpected error has occurred, try again later"];
  }

  const schema = z.array(refreshTokenSchema);
  const validatedToken = schema.safeParse(token.rows);

  if (!validatedToken.success) {
    logger.error("Failed to get refresh token:", validatedToken.error);
    return [null, "Unexpected error has occurred, try again later"];
  }

  return [validatedToken.data[0] ?? null, null];
}

async function setRefreshToken(
  user_id: string,
  token: string,
  expiresAt: Date,
): Promise<Result<null, string>> {
  const sql = `
  UPDATE EMUL8.USERS
  SET REFRESH_TOKEN = $1, REFRESH_EXPIRES = $2
  WHERE USER_ID = $3;`;

  const [_, error] = await db.execute(sql, [token, expiresAt, user_id]);

  if (error != null) {
    return [null, "Unexpected error has occurred, try again later"];
  }

  return [null, null];
}

async function invalidateRefreshToken(user_id: string) {
  const sql = `
  UPDATE EMUL8.USERS
  SET REFRESH_TOKEN = null, REFRESH_EXPIRES = null
  WHERE USER_ID = $1;`;

  const [_, error] = await db.execute(sql, [user_id]);

  if (error != null) {
    return [null, "Unexpected error has occurred, try again later"];
  }

  return [null, null];
}

async function getUserByUsername(
  username: string,
): Promise<Result<User | null, string>> {
  const sql = `
  SELECT USER_ID, USERNAME, PASSWORD_HASH, REFRESH_TOKEN, REFRESH_EXPIRES
  FROM EMUL8.USERS
  WHERE USERNAME = $1;`;

  const [user, error] = await db.execute(sql, [username]);

  if (error != null) {
    return [null, "Unexpected error has occurred, try again later"];
  }

  const schema = z.array(userSchema);
  const parsedUser = schema.safeParse(user.rows);

  if (!parsedUser.success) {
    logger.error("Failed to get user by username:", parsedUser.error);
    return [null, "Unexpected error has occurred, try again later"];
  }

  return [parsedUser.data[0] ?? null, null];
}

export const authRepository = {
  createUser,
  getRefreshToken,
  setRefreshToken,
  invalidateRefreshToken,
  getUserByUsername,
};

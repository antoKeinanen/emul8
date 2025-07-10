import { z } from "zod/v4";

export const refreshTokenSchema = z.object({
  refresh_token: z.jwt().nullable(),
  refresh_expires: z.date().nullable(),
});

export const userSchema = z.object({
  user_id: z.uuid(),
  username: z.string(),
  password_hash: z.string(),
  ...refreshTokenSchema.shape,
});

export type RefreshToken = z.infer<typeof refreshTokenSchema>;
export type User = z.infer<typeof userSchema>;

import jwt from "jsonwebtoken";
import { env } from "$env/dynamic/private";

// Validate JWT_SECRET at module initialization
if (!env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export function encode(user: User) {
    return jwt.sign(user, env.JWT_SECRET as string, { expiresIn: "7d" });
}

export function decode(token: string) {
  try {
    return jwt.verify(token, env.JWT_SECRET as string) as User;
  } catch {
    return null;
  }
}

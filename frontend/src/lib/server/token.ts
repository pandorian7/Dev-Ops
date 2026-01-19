import jwt from "jsonwebtoken";
import { env } from "$env/dynamic/private";

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

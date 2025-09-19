import jwt from "jsonwebtoken";
import { JWT_SECRET } from "$env/static/private";

export function encode(user: User) {
    return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function decode(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as User;
  } catch {
    return null;
  }
}

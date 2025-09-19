import jwt from "jsonwebtoken";

import type { User } from "./types";

const JWT_SECRET = process.env.JWT_SECRET ?? "secret";

export function encode(user: User) {
    return jwt.sign(user, JWT_SECRET, { noTimestamp: true });
}

export function decode(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as User;
  } catch {
    return null;
  }
}

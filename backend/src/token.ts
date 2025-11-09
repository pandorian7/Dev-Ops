import jwt from "jsonwebtoken";

import type { User } from "./types";

const JWT_SECRET = process.env.JWT_SECRET ?? "secret";

export function encode(payload: object) {
    return jwt.sign(payload, JWT_SECRET, { noTimestamp: true });
}

export function decode(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

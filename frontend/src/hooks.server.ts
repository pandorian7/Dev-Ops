import type { Handle } from "@sveltejs/kit";

import { JWT_SECRET } from "$env/static/private";

import jwt from "jsonwebtoken";

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get("token") ?? "";

  try {
    const user = jwt.verify(token, JWT_SECRET) as User;
    event.locals.user = user;
  } catch {
    event.locals.user = null;
  }

  return resolve(event);
};

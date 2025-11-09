import type { Handle } from "@sveltejs/kit";

import { env } from "$env/dynamic/private";

import jwt from "jsonwebtoken";

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get("token") ?? "";

  try {
    const user = jwt.verify(token, env.JWT_SECRET as string) as User;
    event.locals.user = user;
  } catch {
    event.locals.user = null;
  }

  return resolve(event);
};

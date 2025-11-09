import { redirect, type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ cookies }) => {
  cookies.delete("token", { path: "/" });
  redirect(307, "/");
};

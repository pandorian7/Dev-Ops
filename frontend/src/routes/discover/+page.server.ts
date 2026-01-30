import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { user }, fetch, request }) => {
  if (!user) redirect(307, "/connect-spotify");

  const backendBaseUrl = process.env.BACKEND_INTERNAL_URL || "http://backend:3000";
  const cookieHeader = request.headers.get("cookie") ?? "";
  
  // Fetch discover playlists
  let discoverPlaylists = [];
  try {
    const res = await fetch(`${backendBaseUrl}/discover/playlists`, {
      headers: { cookie: cookieHeader },
    });
    if (res.ok) {
      const data = await res.json();
      discoverPlaylists = data.playlists || [];
    }
  } catch (err) {
    console.error('Failed to fetch discover playlists:', err);
  }
  
  return { user, discoverPlaylists };
};

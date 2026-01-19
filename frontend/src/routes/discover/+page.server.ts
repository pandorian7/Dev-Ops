import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { user }, fetch }) => {
  if (!user) redirect(307, "/connect-spotify");
  
  // Fetch discover playlists
  let discoverPlaylists = [];
  try {
    const res = await fetch('/api/discover/playlists');
    if (res.ok) {
      const data = await res.json();
      discoverPlaylists = data.playlists || [];
    }
  } catch (err) {
    console.error('Failed to fetch discover playlists:', err);
  }
  
  return { user, discoverPlaylists };
};

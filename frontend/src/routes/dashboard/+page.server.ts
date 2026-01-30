import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { user }, fetch, request }) => {
  if (!user) redirect(307, "/connect-spotify");

  // Server-side loads must call the backend explicitly (relative `/api/*` calls
  // are handled internally by SvelteKit and won't go through nginx).
  const backendBaseUrl = process.env.BACKEND_INTERNAL_URL || "http://backend:3000";
  const cookieHeader = request.headers.get("cookie") ?? "";
  
  // Fetch user's playlists
  let playlists = [];
  try {
    const playlistsRes = await fetch(`${backendBaseUrl}/playlists`, {
      headers: { cookie: cookieHeader },
    });
    if (playlistsRes.ok) {
      const data = await playlistsRes.json();
      playlists = data.playlists || [];
    }
  } catch (err) {
    console.error('Failed to fetch playlists:', err);
  }
  
  // Fetch saved tracks
  let savedTracks = [];
  let savedTracksTotal = 0;
  let savedTracksLimit = 50;
  let savedTracksOffset = 0;
  try {
    const tracksRes = await fetch(`${backendBaseUrl}/spotify/saved-tracks?limit=${savedTracksLimit}&offset=${savedTracksOffset}`,
    {
      headers: { cookie: cookieHeader },
    });
    if (tracksRes.ok) {
      const data = await tracksRes.json();
      savedTracks = data.tracks || [];
      savedTracksTotal = data.total || 0;
      savedTracksLimit = data.limit || savedTracksLimit;
      savedTracksOffset = data.offset || savedTracksOffset;
    }
  } catch (err) {
    console.error('Failed to fetch saved tracks:', err);
  }

  return { user, playlists, savedTracks, savedTracksTotal, savedTracksLimit, savedTracksOffset };
};

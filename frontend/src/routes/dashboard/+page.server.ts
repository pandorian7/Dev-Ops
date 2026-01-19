import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { user }, fetch }) => {
  if (!user) redirect(307, "/connect-spotify");
  
  // Fetch user's playlists
  let playlists = [];
  try {
    const playlistsRes = await fetch('/api/playlists');
    if (playlistsRes.ok) {
      const data = await playlistsRes.json();
      playlists = data.playlists || [];
    }
  } catch (err) {
    console.error('Failed to fetch playlists:', err);
  }
  
  // Fetch saved tracks
  let savedTracks = [];
  try {
    const tracksRes = await fetch('/api/spotify/saved-tracks');
    if (tracksRes.ok) {
      const data = await tracksRes.json();
      savedTracks = data.tracks || [];
    }
  } catch (err) {
    console.error('Failed to fetch saved tracks:', err);
  }
  
  return { user, playlists, savedTracks };
};

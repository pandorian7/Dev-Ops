<script lang="ts">
  import { env } from "$env/dynamic/public";


  const state = crypto.randomUUID();
  const connectUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${env.PUBLIC_SPOTIFY_CLIENT_ID}&scope=${env.PUBLIC_SPOTIFY_SCOPES}&redirect_uri=${env.PUBLIC_SPOTIFY_REDIRECT_URI}&state=${state}`;
</script>

<div class="connect-root d-flex align-items-center justify-content-center">
  <div class="connect-card text-center p-5 rounded shadow-lg">
    <div class="brand mb-3">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#1db954"/><path d="M7 12.5c1.6-1 3.6-1.1 5.4-0.4" stroke="#081018" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <h1 class="mb-2">Connect to Spotify</h1>
    <p class="muted mb-4">Authorize the app to access your Spotify account to sync playlists and play tracks.</p>

    <a class="btn connect-btn d-inline-flex align-items-center" href={connectUrl} role="button">
      <svg class="me-2" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#fff" opacity="0"/><path d="M7.5 10.5c1.833-1.167 4.5-1.333 7-0.333" stroke="#081018" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="#fff"/><path d="M8 13.5c1.333-0.833 3.167-1 4.667-0.333" stroke="#081018" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="#fff"/></svg>
      Connect with Spotify
    </a>

    <div class="helper mt-4 muted">You will be redirected to Spotify to complete the authorization.</div>
  </div>
</div>

<style>
  :root{ --bg:#0f1113; --muted:#bfc3c6; --accent:#1db954; }

  .connect-root{ min-height:70vh; background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005)); color:var(--muted); }

  .connect-card{ max-width:720px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border:1px solid rgba(255,255,255,0.03); }

  .connect-card h1{ color:var(--accent); font-size:1.6rem; margin-bottom:.25rem; }
  .connect-card .muted{ color:var(--muted); opacity:0.9; }

  .connect-btn{ background:var(--accent); color:#081018; padding:.65rem 1.2rem; border-radius:10px; font-weight:700; text-decoration:none; box-shadow: 0 6px 20px rgba(29,185,84,0.08); border: none; }
  .connect-btn:hover{ transform:translateY(-2px); box-shadow: 0 10px 30px rgba(29,185,84,0.12); }

  .helper{ font-size:0.9rem; color:var(--muted); }

  @media (max-width:600px){
    .connect-card{ padding:2rem 1.5rem; }
    .connect-card h1{ font-size:1.25rem; }
  }
</style>

<script lang="ts">
  import { playlists, spotify } from '$lib/api';
  import { onMount } from 'svelte';
  
  // SvelteKit page data
  export let data: any;

  const tag = data?.user?.name ?? data?.user?.email ?? 'Guest';
  
  let savedTracks = data?.savedTracks || [];
  let userPlaylists = data?.playlists || [];
  let currentPlaylist: any = null;
  let currentTracks: any[] = savedTracks;
  let searchQuery = '';
  let searchResults: any[] = [];
  let isSearching = false;
  let showCreatePlaylist = false;
  let newPlaylistName = '';
  let newPlaylistDescription = '';
  
  // Local UI state: which track index is 'playing'
  let playing: number = -1;
  function togglePlay(i: number) {
    playing = playing === i ? -1 : i;
  }
  
  async function handleSearch() {
    if (!searchQuery.trim()) {
      searchResults = [];
      isSearching = false;
      return;
    }
    
    isSearching = true;
    try {
      const result = await spotify.searchTracks(searchQuery);
      searchResults = result.tracks || [];
    } catch (err) {
      console.error('Search failed:', err);
      searchResults = [];
    }
  }
  
  async function createPlaylist() {
    if (!newPlaylistName.trim()) return;
    
    try {
      const result = await playlists.create(newPlaylistName, newPlaylistDescription);
      userPlaylists = [result.playlist, ...userPlaylists];
      newPlaylistName = '';
      newPlaylistDescription = '';
      showCreatePlaylist = false;
    } catch (err) {
      console.error('Failed to create playlist:', err);
    }
  }
  
  async function addTrackToPlaylist(track: any, playlistId: string) {
    try {
      await playlists.addTrack(playlistId, track);
      // Refresh playlist if it's currently displayed
      if (currentPlaylist?._id === playlistId) {
        const updated = await playlists.getById(playlistId);
        currentPlaylist = updated.playlist;
        currentTracks = currentPlaylist.tracks;
      }
    } catch (err) {
      console.error('Failed to add track:', err);
    }
  }
  
  function selectPlaylist(playlist: any) {
    currentPlaylist = playlist;
    currentTracks = playlist.tracks || [];
    searchResults = [];
    searchQuery = '';
    isSearching = false;
  }
  
  function viewSavedTracks() {
    currentPlaylist = null;
    currentTracks = savedTracks;
    searchResults = [];
    searchQuery = '';
    isSearching = false;
  }
  
  function formatDuration(ms: number) {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
</script>

<div class="container-fluid dashboard-root">
  <div class="row">
    <header class="topbar d-flex align-items-center justify-content-between w-100 px-3 py-2">
      <div class="brand d-flex align-items-center">
        <div class="logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#1db954"/><path d="M7 12.5c1.6-1 3.6-1.1 5.4-0.4" stroke="#081018" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <h2 class="ms-2 mb-0 app-title">My Music</h2>
      </div>
      <div class="user-actions d-flex align-items-center">
        <a href="/discover" class="btn btn-sm btn-discover me-3">Discover</a>
        {#if data?.user?.image}
          <img src={data.user.image} alt={tag} class="avatar me-2 rounded" width="36" height="36" />
        {:else}
          <div class="avatar me-2">{tag ? tag.charAt(0).toUpperCase() : 'G'}</div>
        {/if}
        <span class="username me-3">{tag}</span>
        <a class="btn btn-logout btn-sm" href="/logout">Logout</a>
      </div>
    </header>
    
    <!-- Sidebar -->
    <nav class="col-md-3 col-lg-2 d-md-block sidebar py-4 vh-100 position-sticky top-0 overflow-auto">
      <div class="sidebar-sticky">
        <div class="d-flex justify-content-between align-items-center mb-3 px-3">
          <h4 class="text-white mb-0">Library</h4>
          <button class="btn btn-sm btn-add" on:click={() => showCreatePlaylist = !showCreatePlaylist}>+</button>
        </div>
        
        {#if showCreatePlaylist}
          <div class="create-playlist-form px-3 mb-3">
            <input 
              type="text" 
              class="form-control form-control-sm mb-2" 
              placeholder="Playlist name" 
              bind:value={newPlaylistName}
            />
            <input 
              type="text" 
              class="form-control form-control-sm mb-2" 
              placeholder="Description (optional)" 
              bind:value={newPlaylistDescription}
            />
            <button class="btn btn-primary btn-sm w-100" on:click={createPlaylist}>Create</button>
          </div>
        {/if}
        
        <ul class="nav flex-column">
          <li class="nav-item mb-2">
            <button
              class="nav-link d-flex align-items-center text-white w-100 {!currentPlaylist ? 'active' : ''}"
              on:click={viewSavedTracks}
            >
              <span class="me-2">♥</span>
              Saved Tracks ({savedTracks.length})
            </button>
          </li>
          {#each userPlaylists as playlist}
            <li class="nav-item mb-2">
              <button
                class="nav-link d-flex align-items-center text-white w-100 {currentPlaylist?._id === playlist._id ? 'active' : ''}"
                on:click={() => selectPlaylist(playlist)}
              >
                <span class="me-2">📁</span>
                {playlist.name}
              </button>
            </li>
          {/each}
        </ul>
      </div>
    </nav>
    
    <!-- Main Content -->
    <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
      <section class="content p-4">
        <div class="search-bar mb-4">
          <input 
            type="text" 
            class="form-control search-input" 
            placeholder="Search for songs..." 
            bind:value={searchQuery}
            on:input={handleSearch}
          />
        </div>
        
        <h1 class="mb-4 mt-1">{currentPlaylist ? currentPlaylist.name : 'Saved Tracks'}</h1>
        {#if currentPlaylist?.description}
          <p class="text-muted">{currentPlaylist.description}</p>
        {/if}

        <div class="tracks-card p-3 rounded shadow-sm">
          {#if isSearching && searchResults.length > 0}
            <h5 class="text-white mb-3">Search Results</h5>
            <table class="table track-table mb-0">
              <thead>
                <tr>
                  <th class="col-1">#</th>
                  <th class="col-5">Title</th>
                  <th class="col-3">Artist</th>
                  <th class="col-2 d-none d-sm-table-cell">Album</th>
                  <th class="col-1 text-end">Duration</th>
                </tr>
              </thead>
              <tbody>
                {#each searchResults as track, i}
                  <tr class="track-row">
                    <td class="align-middle">{i + 1}</td>
                    <td class="d-flex align-items-center">
                      {#if track.imageUrl}
                        <img src={track.imageUrl} alt={track.name} width="48" height="48" class="me-3 rounded" />
                      {:else}
                        <div class="track-placeholder me-3"></div>
                      {/if}
                      <div>
                        <div class="track-title">{track.name}</div>
                      </div>
                    </td>
                    <td class="align-middle">{track.artist}</td>
                    <td class="align-middle d-none d-sm-table-cell">{track.album}</td>
                    <td class="align-middle text-end">{formatDuration(track.duration)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {:else if currentTracks.length > 0}
            <table class="table track-table mb-0">
              <thead>
                <tr>
                  <th class="col-1">#</th>
                  <th class="col-5">Title</th>
                  <th class="col-3">Artist</th>
                  <th class="col-2 d-none d-sm-table-cell">Album</th>
                  <th class="col-1 text-end">Duration</th>
                </tr>
              </thead>
              <tbody>
                {#each currentTracks as track, i}
                  <tr class="track-row {playing === i ? 'playing' : ''}">
                    <td class="align-middle">{i + 1}</td>
                    <td class="d-flex align-items-center">
                      {#if track.imageUrl}
                        <img src={track.imageUrl} alt={track.name} width="48" height="48" class="me-3 rounded" />
                      {:else}
                        <div class="track-placeholder me-3"></div>
                      {/if}
                      <div>
                        <div class="track-title">{track.name}</div>
                      </div>
                    </td>
                    <td class="align-middle">{track.artist}</td>
                    <td class="align-middle d-none d-sm-table-cell">{track.album || 'N/A'}</td>
                    <td class="align-middle text-end">{track.duration ? formatDuration(track.duration) : 'N/A'}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {:else}
            <p class="text-muted text-center py-5">
              {#if isSearching}
                No results found
              {:else if currentPlaylist}
                This playlist is empty. Search for songs to add them!
              {:else}
                No saved tracks found. Connect to Spotify to see your saved music.
              {/if}
            </p>
          {/if}
        </div>
      </section>
    </main>
  </div>
</div>

<style>
  :root{
    --bg:#0f1113;
    --panel:#121416;
    --muted:#bfc3c6;
    --accent:#1db954;
    --surface:#0b0c0d;
    --glass: rgba(255,255,255,0.02);
  }

  .dashboard-root{ background: var(--bg); min-height:100vh; color:var(--muted); font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }

  .topbar{ background: linear-gradient(90deg, rgba(13,17,20,0.9), rgba(17,21,24,0.9)); border-bottom:1px solid rgba(255,255,255,0.03); }
  .app-title{ color:var(--accent); font-size:1rem; font-weight:600; }
  .logo{ display:flex; align-items:center; justify-content:center; }

  .user-actions .avatar{ width:36px; height:36px; background:var(--accent); color:#081018; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; }
  .user-actions .username{ color:#fff; font-weight:600; }
  .btn-logout{ background:transparent; border:1px solid rgba(255,255,255,0.06); color:var(--muted); }
  .btn-discover{ background:var(--accent); border:none; color:#081018; font-weight:600; }
  .btn-discover:hover{ background:#1ed760; color:#081018; }

  .sidebar{ background:linear-gradient(180deg,#0d0d0d,#0b0b0b); padding-top:1.25rem; }
  .sidebar h4{ color:var(--accent); font-weight:600; }
  .sidebar .nav-link{ color:var(--muted); border-radius:8px; transition: all .18s ease; padding:.6rem .9rem; text-align:left; background:transparent; border:none; }
  .sidebar .nav-link:hover{ transform:translateX(4px); background: rgba(29,185,84,0.08); color:#fff; }
  .sidebar .nav-link.active{ background: linear-gradient(90deg, rgba(29,185,84,0.12), rgba(29,185,84,0.06)); color:#fff; box-shadow:0 4px 14px rgba(13,17,20,0.6); }
  
  .btn-add{ background:var(--accent); color:#081018; border:none; border-radius:4px; font-weight:700; }
  .btn-add:hover{ background:#1ed760; }
  
  .create-playlist-form input{ background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; }
  .create-playlist-form input:focus{ background:rgba(255,255,255,0.08); border-color:var(--accent); color:#fff; }
  
  .search-bar{ max-width:600px; }
  .search-input{ background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:0.75rem 1rem; border-radius:24px; }
  .search-input:focus{ background:rgba(255,255,255,0.08); border-color:var(--accent); color:#fff; }
  .search-input::placeholder{ color:var(--muted); }

  .content h1{ color:var(--accent); font-weight:700; }

  .tracks-card{ background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border:1px solid rgba(255,255,255,0.03); }
  .track-table { color:var(--muted); }
  .track-table thead th{ color:rgba(255,255,255,0.6); border-bottom:1px solid rgba(255,255,255,0.03); }
  .track-table tbody tr{ transition: background .15s ease, transform .08s ease; }
  .track-table tbody tr:hover{ background: rgba(255,255,255,0.02); transform: translateY(-2px); }
  .track-table img{ object-fit:cover; }
  
  .track-placeholder{ width:48px; height:48px; background:rgba(255,255,255,0.05); border-radius:4px; }

  /* Force dark table colors (override Bootstrap defaults which may apply white backgrounds) */
  .tracks-card .table,
  .tracks-card .table thead,
  .tracks-card .table tbody,
  .tracks-card .table tr,
  .tracks-card .table th,
  .tracks-card .table td {
    background: transparent !important;
    color: var(--muted) !important;
    border-color: rgba(255,255,255,0.03) !important;
  }

  /* Ensure table cells use subtle separators and align with card background */
  .tracks-card .table td,
  .tracks-card .table th {
    vertical-align: middle;
    border-top: 1px solid rgba(255,255,255,0.02) !important;
    background: transparent !important;
  }

  /* Slightly darken the card body so rows feel distinct from page background */
  .tracks-card{ background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005)); }

  /* Track row actions and play state */
  .row-actions-cell{ width:72px; }
  .row-actions{ display:inline-flex; gap:0.5rem; align-items:center; justify-content:flex-end; opacity:0; transform:translateX(6px); transition: all .12s ease; }
  .track-row:hover .row-actions{ opacity:1; transform:translateX(0); }

  .play-btn{ background:var(--accent); color:#081018; border-radius:8px; width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center; border:0; }
  .play-btn svg{ display:block; }

  .track-row.playing{ background: linear-gradient(90deg, rgba(29,185,84,0.06), rgba(29,185,84,0.02)); }

  .track-title{ color:#fff; font-weight:600; }
  .track-sub{ font-size:0.8rem; color:var(--muted); }

  /* Responsive tweaks */
  @media (max-width: 768px){
    .sidebar{ display:flex; flex-direction:row; gap:.5rem; overflow:auto; min-height:unset; }
    .sidebar .nav { flex-direction:row; }
    .sidebar .nav-link{ white-space:nowrap; }
    .app-title{ display:none; }
  }
</style>

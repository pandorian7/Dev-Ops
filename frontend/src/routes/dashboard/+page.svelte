<script lang="ts">
  import { playlists, spotify } from '$lib/api';
  import { onMount } from 'svelte';
  
  // SvelteKit page data
  export let data: any;

  const tag = data?.user?.name ?? data?.user?.email ?? 'Guest';
  
  let savedTracks = data?.savedTracks || [];
  let savedTracksTotal = data?.savedTracksTotal ?? savedTracks.length;
  let savedTracksLimit = data?.savedTracksLimit ?? 50;
  let savedTracksOffset = data?.savedTracksOffset ?? 0;
  let userPlaylists = data?.playlists || [];
  let currentPlaylist: any = null;
  let currentTracks: any[] = savedTracks;
  let searchQuery = '';
  let searchResults: any[] = [];
  let isSearching = false;
  let showCreatePlaylist = false;
  let newPlaylistName = '';
  let newPlaylistDescription = '';
  let isLoadingSavedTracks = false;

  // Per-track UI state for the "Add to playlist" dropdown
  let addTargetByTrackId: Record<string, string> = {};
  
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
    } finally {
      // We keep displaying the search table when there is a query.
      isSearching = true;
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
      const result = await playlists.addTrack(playlistId, track);
      const updatedPlaylist = result?.playlist;

      if (updatedPlaylist?._id) {
        userPlaylists = userPlaylists.map((p: any) => (p._id === updatedPlaylist._id ? updatedPlaylist : p));
      }

      // Refresh playlist if it's currently displayed
      if (currentPlaylist?._id === playlistId && updatedPlaylist) {
        currentPlaylist = updatedPlaylist;
        currentTracks = updatedPlaylist.tracks || [];
      }
    } catch (err) {
      console.error('Failed to add track:', err);
    }
  }

  async function deletePlaylist(playlistId: string) {
    const playlist = userPlaylists.find((p: any) => p._id === playlistId);
    const name = playlist?.name ?? 'this playlist';
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;

    try {
      await playlists.delete(playlistId);
      userPlaylists = userPlaylists.filter((p: any) => p._id !== playlistId);

      if (currentPlaylist?._id === playlistId) {
        viewSavedTracks();
      }
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    }
  }

  async function loadSavedTracksPage(newOffset: number) {
    isLoadingSavedTracks = true;
    try {
      const result = await spotify.getSavedTracks({ limit: savedTracksLimit, offset: newOffset });
      savedTracks = result.tracks || [];
      savedTracksTotal = result.total ?? savedTracksTotal;
      savedTracksLimit = result.limit ?? savedTracksLimit;
      savedTracksOffset = result.offset ?? newOffset;
      if (!currentPlaylist) {
        currentTracks = savedTracks;
      }
    } catch (err) {
      console.error('Failed to load saved tracks page:', err);
    } finally {
      isLoadingSavedTracks = false;
    }
  }

  async function removeTrackFromCurrentPlaylist(trackId: string) {
    if (!currentPlaylist?._id) return;
    if (!trackId) return;

    try {
      const result = await playlists.removeTrack(currentPlaylist._id, trackId);
      const updatedPlaylist = result?.playlist;
      if (updatedPlaylist?._id) {
        currentPlaylist = updatedPlaylist;
        currentTracks = updatedPlaylist.tracks || [];
        userPlaylists = userPlaylists.map((p: any) => (p._id === updatedPlaylist._id ? updatedPlaylist : p));
      } else {
        // Fallback: optimistic update
        currentTracks = currentTracks.filter((t: any) => t.spotifyId !== trackId);
      }
    } catch (err) {
      console.error('Failed to remove track:', err);
    }
  }

  function getTrackKey(track: any, index: number) {
    return track?.spotifyId || track?._id || `${track?.name ?? 'track'}:${index}`;
  }

  function getDefaultAddTarget() {
    return currentPlaylist?._id || userPlaylists?.[0]?._id || '';
  }

  function getAddTargetFor(track: any, index: number) {
    const key = getTrackKey(track, index);
    return addTargetByTrackId[key] || getDefaultAddTarget();
  }

  function setAddTargetFor(track: any, index: number, playlistId: string) {
    const key = getTrackKey(track, index);
    addTargetByTrackId = { ...addTargetByTrackId, [key]: playlistId };
  }
  
  async function selectPlaylist(playlist: any) {
    // Always fetch latest playlist so newly-added tracks appear reliably.
    try {
      const latest = await playlists.getById(playlist._id);
      if (latest?.playlist) {
        currentPlaylist = latest.playlist;
        currentTracks = latest.playlist.tracks || [];
        userPlaylists = userPlaylists.map((p: any) => (p._id === latest.playlist._id ? latest.playlist : p));
      } else {
        currentPlaylist = playlist;
        currentTracks = playlist.tracks || [];
      }
    } catch {
      currentPlaylist = playlist;
      currentTracks = playlist.tracks || [];
    }
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

  $: isViewingSavedTracks = !currentPlaylist && !isSearching;
  $: savedTracksPage = Math.floor(savedTracksOffset / savedTracksLimit) + 1;
  $: savedTracksTotalPages = Math.max(1, Math.ceil(savedTracksTotal / savedTracksLimit));
  
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
              Saved Tracks ({savedTracksTotal})
            </button>
          </li>
          {#each userPlaylists as playlist}
            <li class="nav-item mb-2">
              <div class="d-flex align-items-center gap-2">
                <button
                  class="nav-link d-flex align-items-center text-white w-100 {currentPlaylist?._id === playlist._id ? 'active' : ''}"
                  on:click={() => selectPlaylist(playlist)}
                >
                  <span class="me-2">📁</span>
                  {playlist.name}
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  title="Delete playlist"
                  on:click={() => deletePlaylist(playlist._id)}
                >
                  🗑️
                </button>
              </div>
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
                  <th class="col-2">Add</th>
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
                    <td class="align-middle">
                      <div class="d-flex gap-2 add-controls">
                        <select
                          class="form-select form-select-sm add-select"
                          value={getAddTargetFor(track, i)}
                          on:change={(e) => setAddTargetFor(track, i, (e.currentTarget as HTMLSelectElement).value)}
                          disabled={userPlaylists.length === 0}
                        >
                          {#if userPlaylists.length === 0}
                            <option value="">Create a playlist first</option>
                          {:else}
                            {#each userPlaylists as p}
                              <option value={p._id}>{p.name}</option>
                            {/each}
                          {/if}
                        </select>
                        <button
                          class="btn btn-sm btn-primary"
                          disabled={!getAddTargetFor(track, i)}
                          on:click={() => addTrackToPlaylist(track, getAddTargetFor(track, i))}
                        >
                          +
                        </button>
                      </div>
                    </td>
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
                  <th class="col-2">Add</th>
                  {#if currentPlaylist}
                    <th class="col-1">Remove</th>
                  {/if}
                </tr>
              </thead>
              <tbody>
                {#each currentTracks as track, i}
                  <tr class="track-row {playing === i ? 'playing' : ''}">
                    <td class="align-middle">{(isViewingSavedTracks ? savedTracksOffset : 0) + i + 1}</td>
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
                    <td class="align-middle">
                      <div class="d-flex gap-2 add-controls">
                        <select
                          class="form-select form-select-sm add-select"
                          value={getAddTargetFor(track, i)}
                          on:change={(e) => setAddTargetFor(track, i, (e.currentTarget as HTMLSelectElement).value)}
                          disabled={userPlaylists.length === 0}
                        >
                          {#if userPlaylists.length === 0}
                            <option value="">Create a playlist first</option>
                          {:else}
                            {#each userPlaylists as p}
                              <option value={p._id}>{p.name}</option>
                            {/each}
                          {/if}
                        </select>
                        <button
                          class="btn btn-sm btn-primary"
                          disabled={!getAddTargetFor(track, i)}
                          on:click={() => addTrackToPlaylist(track, getAddTargetFor(track, i))}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    {#if currentPlaylist}
                      <td class="align-middle">
                        <button
                          class="btn btn-sm btn-outline-danger"
                          title="Remove from playlist"
                          on:click={() => removeTrackFromCurrentPlaylist(track.spotifyId)}
                        >
                          🗑️
                        </button>
                      </td>
                    {/if}
                  </tr>
                {/each}
              </tbody>
            </table>

            {#if isViewingSavedTracks && savedTracksTotal > savedTracksLimit}
              <div class="d-flex align-items-center justify-content-between mt-3">
                <div class="text-muted small">
                  Page {savedTracksPage} of {savedTracksTotalPages}
                </div>
                <div class="d-flex gap-2">
                  <button
                    class="btn btn-sm btn-outline-light"
                    disabled={isLoadingSavedTracks || savedTracksOffset <= 0}
                    on:click={() => loadSavedTracksPage(Math.max(0, savedTracksOffset - savedTracksLimit))}
                  >
                    Prev
                  </button>
                  <button
                    class="btn btn-sm btn-outline-light"
                    disabled={isLoadingSavedTracks || savedTracksOffset + savedTracksLimit >= savedTracksTotal}
                    on:click={() => loadSavedTracksPage(savedTracksOffset + savedTracksLimit)}
                  >
                    Next
                  </button>
                </div>
              </div>
            {/if}
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

  .track-row.playing{ background: linear-gradient(90deg, rgba(29,185,84,0.06), rgba(29,185,84,0.02)); }

  .track-title{ color:#fff; font-weight:600; }
  .track-placeholder{ width:48px; height:48px; background:rgba(255,255,255,0.05); border-radius:4px; }

  .add-controls{ align-items:center; flex-wrap:nowrap; min-width: 320px; }
  .add-select{ min-width: 260px; }

  /* On narrow screens, let the controls shrink instead of overflowing */
  @media (max-width: 992px){
    .add-controls{ min-width: 240px; }
    .add-select{ min-width: 180px; }
  }

  /* Responsive tweaks */
  @media (max-width: 768px){
    .sidebar{ display:flex; flex-direction:row; gap:.5rem; overflow:auto; min-height:unset; }
    .sidebar .nav { flex-direction:row; }
    .sidebar .nav-link{ white-space:nowrap; }
    .app-title{ display:none; }
  }
</style>

<script lang="ts">
  import { playlists, users } from '$lib/api';
  
  export let data: any;
  
  let discoverPlaylists = data?.discoverPlaylists || [];
  let searchQuery = '';
  let searchResults: any[] = [];
  let searchType: 'users' | 'playlists' = 'users';
  let selectedUserPlaylists: any[] = [];
  let selectedUserEmail = '';
  
  async function handleSearch() {
    if (!searchQuery.trim()) {
      searchResults = [];
      return;
    }
    
    try {
      if (searchType === 'users') {
        const result = await users.search(searchQuery);
        searchResults = result.users || [];
      }
    } catch (err) {
      console.error('Search failed:', err);
      searchResults = [];
    }
  }
  
  async function viewUserPlaylists(email: string) {
    try {
      const result = await users.getPlaylists(email);
      selectedUserPlaylists = result.playlists || [];
      selectedUserEmail = email;
    } catch (err) {
      console.error('Failed to fetch user playlists:', err);
      selectedUserPlaylists = [];
    }
  }
  
  async function likePlaylist(playlistId: string) {
    try {
      await playlists.like(playlistId);
      // Refresh the playlist
      const updated = await playlists.getById(playlistId);
      const index = discoverPlaylists.findIndex((p: any) => p._id === playlistId);
      if (index >= 0) {
        discoverPlaylists[index] = updated.playlist;
      }
    } catch (err) {
      console.error('Failed to like playlist:', err);
    }
  }
  
  async function unlikePlaylist(playlistId: string) {
    try {
      await playlists.unlike(playlistId);
      // Refresh the playlist
      const updated = await playlists.getById(playlistId);
      const index = discoverPlaylists.findIndex((p: any) => p._id === playlistId);
      if (index >= 0) {
        discoverPlaylists[index] = updated.playlist;
      }
    } catch (err) {
      console.error('Failed to unlike playlist:', err);
    }
  }
  
  function isLiked(playlist: any) {
    return playlist.likes?.includes(data?.user?.email);
  }
</script>

<div class="container py-5 discover-page">
  <div class="row">
    <div class="col-12 mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <h1 class="page-title">Discover</h1>
        <a href="/dashboard" class="btn btn-outline-light">Back to Dashboard</a>
      </div>
    </div>
    
    <div class="col-12 mb-4">
      <div class="search-section">
        <div class="d-flex gap-2 mb-3">
          <button 
            class="btn {searchType === 'users' ? 'btn-primary' : 'btn-outline-light'}"
            on:click={() => searchType = 'users'}
          >
            Search Users
          </button>
          <button 
            class="btn {searchType === 'playlists' ? 'btn-primary' : 'btn-outline-light'}"
            on:click={() => searchType = 'playlists'}
          >
            Search Playlists
          </button>
        </div>
        
        <input 
          type="text" 
          class="form-control search-input mb-3" 
          placeholder={searchType === 'users' ? 'Search for users...' : 'Search for playlists...'}
          bind:value={searchQuery}
          on:input={handleSearch}
        />
        
        {#if searchResults.length > 0 && searchType === 'users'}
          <div class="search-results">
            <h5 class="text-white mb-3">Users</h5>
            <div class="row g-3">
              {#each searchResults as user}
                <div class="col-md-4 col-lg-3">
                  <div class="user-card p-3 rounded">
                    {#if user.image}
                      <img src={user.image} alt={user.name} class="user-avatar mb-2" />
                    {:else}
                      <div class="user-avatar-placeholder mb-2">{user.name.charAt(0).toUpperCase()}</div>
                    {/if}
                    <h6 class="text-white">{user.name}</h6>
                    <p class="text-muted small">{user.email}</p>
                    <button 
                      class="btn btn-sm btn-primary w-100"
                      on:click={() => viewUserPlaylists(user.email)}
                    >
                      View Playlists
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
        
        {#if selectedUserPlaylists.length > 0}
          <div class="user-playlists mt-4">
            <h5 class="text-white mb-3">Playlists from {selectedUserEmail}</h5>
            <div class="row g-3">
              {#each selectedUserPlaylists as playlist}
                <div class="col-md-6 col-lg-4">
                  <div class="playlist-card p-3 rounded">
                    <h6 class="text-white">{playlist.name}</h6>
                    {#if playlist.description}
                      <p class="text-muted small">{playlist.description}</p>
                    {/if}
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="text-muted small">{playlist.tracks?.length || 0} tracks</span>
                      <div class="d-flex gap-2">
                        <span class="text-muted small">❤️ {playlist.likes?.length || 0}</span>
                        {#if isLiked(playlist)}
                          <button 
                            class="btn btn-sm btn-outline-danger"
                            on:click={() => unlikePlaylist(playlist._id)}
                          >
                            Unlike
                          </button>
                        {:else}
                          <button 
                            class="btn btn-sm btn-outline-light"
                            on:click={() => likePlaylist(playlist._id)}
                          >
                            Like
                          </button>
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
    
    <div class="col-12">
      <h3 class="section-title mb-4">Popular Playlists</h3>
      <div class="row g-3">
        {#if discoverPlaylists.length > 0}
          {#each discoverPlaylists as playlist}
            <div class="col-md-6 col-lg-4">
              <div class="playlist-card p-3 rounded">
                <h6 class="text-white">{playlist.name}</h6>
                {#if playlist.description}
                  <p class="text-muted small">{playlist.description}</p>
                {/if}
                <p class="text-muted small">by {playlist.owner}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-muted small">{playlist.tracks?.length || 0} tracks</span>
                  <div class="d-flex gap-2">
                    <span class="text-muted small">❤️ {playlist.likes?.length || 0}</span>
                    {#if isLiked(playlist)}
                      <button 
                        class="btn btn-sm btn-outline-danger"
                        on:click={() => unlikePlaylist(playlist._id)}
                      >
                        Unlike
                      </button>
                    {:else}
                      <button 
                        class="btn btn-sm btn-outline-light"
                        on:click={() => likePlaylist(playlist._id)}
                      >
                        Like
                      </button>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          {/each}
        {:else}
          <div class="col-12">
            <p class="text-muted text-center">No playlists available yet. Create one to get started!</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .discover-page {
    background: #0f1113;
    min-height: 100vh;
    color: #bfc3c6;
  }
  
  .page-title {
    color: #1db954;
    font-weight: 700;
  }
  
  .section-title {
    color: #fff;
    font-weight: 600;
  }
  
  .search-input {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: #fff;
    padding: 0.75rem 1rem;
    border-radius: 24px;
  }
  
  .search-input:focus {
    background: rgba(255,255,255,0.08);
    border-color: #1db954;
    color: #fff;
  }
  
  .search-input::placeholder {
    color: #bfc3c6;
  }
  
  .user-card, .playlist-card {
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
    border: 1px solid rgba(255,255,255,0.03);
    transition: all 0.2s;
  }
  
  .user-card:hover, .playlist-card:hover {
    background: rgba(255,255,255,0.04);
    transform: translateY(-2px);
  }
  
  .user-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .user-avatar-placeholder {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #1db954;
    color: #081018;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 700;
  }
  
  .btn-primary {
    background: #1db954;
    border: none;
    color: #081018;
  }
  
  .btn-primary:hover {
    background: #1ed760;
  }
  
  .btn-outline-light {
    border-color: rgba(255,255,255,0.2);
    color: #fff;
  }
  
  .btn-outline-light:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.3);
  }
  
  .btn-outline-danger {
    border-color: #dc3545;
    color: #dc3545;
  }
  
  .btn-outline-danger:hover {
    background: #dc3545;
    color: #fff;
  }
</style>

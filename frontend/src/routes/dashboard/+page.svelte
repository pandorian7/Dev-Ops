<script lang="ts">
  // SvelteKit page data
  export let data: any;

  const tag = data?.user?.name ?? data?.user?.email ?? 'Guest';

  // Local UI state: which track index is 'playing'
  let playing: number = -1;
  function togglePlay(i: number) {
    playing = playing === i ? -1 : i;
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
        <h4 class="text-white mb-4 ms-3">Playlists</h4>
        <ul class="nav flex-column">
          <li class="nav-item mb-3">
            <a
              class="nav-link active d-flex align-items-center text-white"
              href="/"
            >
              <img
                src="https://placehold.co/40"
                alt="After Hours"
                class="rounded me-2"
                width="40"
                height="40"
              />
              After Hours
            </a>
          </li>
          <li class="nav-item mb-3">
            <a class="nav-link d-flex align-items-center text-white" href="/">
              <img
                src="https://placehold.co/40"
                alt="Future Nostalgia"
                class="rounded me-2"
                width="40"
                height="40"
              />
              Future Nostalgia
            </a>
          </li>
          <li class="nav-item mb-3">
            <a class="nav-link d-flex align-items-center text-white" href="/">
              <img
                src="https://placehold.co/40"
                alt="Fine Line"
                class="rounded me-2"
                width="40"
                height="40"
              />
              Fine Line
            </a>
          </li>
          <li class="nav-item mb-3">
            <a class="nav-link d-flex align-items-center text-white" href="/">
              <img
                src="https://placehold.co/40"
                alt="Justice"
                class="rounded me-2"
                width="40"
                height="40"
              />
              Justice
            </a>
          </li>
        </ul>
      </div>
    </nav>
    <!-- Main Content -->
    <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
      <section class="content p-4">
        <h1 class="mb-4 mt-1">After Hours</h1>

        <div class="tracks-card p-3 rounded shadow-sm">
          <table class="table track-table mb-0">
            <thead>
              <tr>
                <th class="col-1">#</th>
                <th class="col-6">Title</th>
                <th class="col-3">Artist</th>
                <th class="col-2 d-none d-sm-table-cell">Album</th>
                <th class="col-1 text-end">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr class="track-row {playing === 0 ? 'playing' : ''}">
                <td class="align-middle">1</td>
                <td class="d-flex align-items-center">
                  <img src="https://placehold.co/48" alt="Blinding Lights" width="48" height="48" class="me-3 rounded" />
                  <div>
                    <div class="track-title">Blinding Lights</div>
                    <div class="track-sub muted">Single • 2019</div>
                  </div>
                </td>
                <td class="align-middle">The Weeknd</td>
                <td class="align-middle d-none d-sm-table-cell">After Hours</td>
                <td class="align-middle text-end">3:20</td>
                
              </tr>

              <tr class="track-row {playing === 1 ? 'playing' : ''}">
                <td class="align-middle">2</td>
                <td class="d-flex align-items-center">
                  <img src="https://placehold.co/48" alt="Save Your Tears" width="48" height="48" class="me-3 rounded" />
                  <div>
                    <div class="track-title">Save Your Tears</div>
                    <div class="track-sub muted">After Hours • 2020</div>
                  </div>
                </td>
                <td class="align-middle">The Weeknd</td>
                <td class="align-middle d-none d-sm-table-cell">After Hours</td>
                <td class="align-middle text-end">3:35</td>
                <td class="align-middle text-end row-actions-cell"></td>
              </tr>
            </tbody>
          </table>
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

  .sidebar{ background:linear-gradient(180deg,#0d0d0d,#0b0b0b); padding-top:1.25rem; }
  .sidebar h4{ color:var(--accent); font-weight:600; }
  .sidebar .nav-link{ color:var(--muted); border-radius:8px; transition: all .18s ease; padding:.6rem .9rem; }
  .sidebar .nav-link:hover{ transform:translateX(4px); background: rgba(29,185,84,0.08); color:#fff; }
  .sidebar .nav-link.active{ background: linear-gradient(90deg, rgba(29,185,84,0.12), rgba(29,185,84,0.06)); color:#fff; box-shadow:0 4px 14px rgba(13,17,20,0.6); }

  .content h1{ color:var(--accent); font-weight:700; }

  .tracks-card{ background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border:1px solid rgba(255,255,255,0.03); }
  .track-table { color:var(--muted); }
  .track-table thead th{ color:rgba(255,255,255,0.6); border-bottom:1px solid rgba(255,255,255,0.03); }
  .track-table tbody tr{ transition: background .15s ease, transform .08s ease; }
  .track-table tbody tr:hover{ background: rgba(255,255,255,0.02); transform: translateY(-2px); }
  .track-table img{ object-fit:cover; }

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

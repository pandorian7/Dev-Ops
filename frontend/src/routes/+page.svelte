<script>
//   import { Music ,TrendingUp, Users } from "@lucide/svelte";
</script>

<section  class="hero-section">
  <div class="hero-overlay"></div>
  <div class="container hero-content">
    <div class="row justify-content-center">
      <div class="col-lg-8 text-center py-5">
        <div class="music-icon">
          <!-- <Music size={48} color="white" /> -->
        </div>
        <h1 class="display-1 fw-bold text-white mb-4">
          Your Music, <span class="gradient-text">Managed</span>
        </h1>
        <p class="lead mb-5 mx-auto" style="max-width: 600px;">
          Connect with Spotify and manage your music like never before. Create
          playlists, discover new tracks, and keep your favorite songs
          organized.
        </p>
        <div
          class="d-flex flex-column flex-sm-row gap-3 justify-content-center"
        >
          <a
            href="/dashboard"
            class="btn btn-gradient btn-lg px-5 py-3 rounded-pill"
          >
            <div class="me-2">
              Get Started
            </div>
            
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="py-5">
  <div class="container">
    <div class="row justify-content-center text-center mb-5">
      <div class="col-lg-8">
        <h2 class="display-4 fw-bold text-white mb-4">
          Everything you need to manage your music
        </h2>
        <p class="lead text-muted">
          Powerful features to help you organize, discover, and enjoy your music
          collection
        </p>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-md-4">
        <div class="card feature-card h-100 border-0">
          <div class="card-body p-4">
            <div class="icon-cyan rounded-3 p-3 d-inline-flex mb-4">
              <!-- <Music size={24} /> -->
            </div>
            <h3 class="h4 text-white mb-3">Smart Organization</h3>
            <p class="text-muted mb-0">
              Automatically organize your music library with intelligent
              categorization and custom playlists.
            </p>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card feature-card h-100 border-0">
          <div class="card-body p-4">
            <div class="icon-emerald rounded-3 p-3 d-inline-flex mb-4">
              <!-- <TrendingUp size={24} /> -->
            </div>
            <h3 class="h4 text-white mb-3">Discover New Music</h3>
            <p class="text-muted mb-0">
              Get personalized recommendations and discover trending tracks
              based on your listening habits.
            </p>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card feature-card h-100 border-0">
          <div class="card-body p-4">
            <div class="icon-purple rounded-3 p-3 d-inline-flex mb-4">
              <!-- <Users size={24} /> -->
            </div>
            <h3 class="h4 text-white mb-3">Social Features</h3>
            <p class="text-muted mb-0">
              Share your favorite playlists and discover what your friends are
              listening to.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  /* :global(body) {
    background: linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a);
    min-height: 100vh;
    color: #cbd5e1;
  } */
  .hero-section {
    position: relative;
    overflow: hidden;
  }
  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to right,
      rgba(6, 182, 212, 0.1),
      rgba(16, 185, 129, 0.1)
    );
  }
  .hero-content {
    position: relative;
    z-index: 2;
  }
  .music-icon {
    background: linear-gradient(to right, #06b6d4, #10b981);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 2rem;
  }
  .gradient-text {
    color: #10b981;
  }
  .btn-gradient {
    background: linear-gradient(to right, #0891b2, #10b981);
    border: none;
    color: white;
    transition: all 0.2s;
  }
  .btn-gradient:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    color: white;
  }
  .feature-card {
    background: rgba(30, 41, 59, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid #475569;
    transition: all 0.2s;
  }
  .feature-card:hover {
    background: rgba(30, 41, 59, 0.7);
    transform: translateY(-5px);
  }
  .icon-cyan {
    color: #22d3ee;
    background: rgba(34, 211, 238, 0.2);
  }
  .icon-emerald {
    color: #34d399;
    background: rgba(52, 211, 153, 0.2);
  }
  .icon-purple {
    color: #a855f7;
    background: rgba(168, 85, 247, 0.2);
  }
</style>

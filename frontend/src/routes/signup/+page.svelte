<script lang="ts">
  import { goto } from "$app/navigation";
  import { auth } from "$lib/api";
  import { dataFromFormSubmitEvent } from "$lib/client";

  async function handleSignUp(submitEvent: SubmitEvent) {
    submitEvent.preventDefault();
    const data = dataFromFormSubmitEvent(submitEvent) as {
      username: string;
      password: string;
      confirmPassword: string;
    };
    if (data.password != data.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await auth.register(data.username, data.password);
      alert("User Creation Successful!");
      goto("/dashboard");
    } catch (err: any) {
      if (err.response && err.response.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Network error. Please try again.");
      }
    }
  }
</script>

<div class="d-flex align-items-center py-5">
  <main class="container">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-10 col-md-7 col-lg-5 col-xxl-4">
        <!-- Brand -->
        <div class="text-center mb-4">
          <span class="logo-dot"><i class="bi bi-music-note-beamed"></i></span>
          <span class="h3 text-white brand">Soundify</span>
        </div>

        <div class="card card-login shadow-sm">
          <div class="card-body p-4 p-md-5">
            <h1 class="h4 text-white mb-3 text-center">Sign up for Soundify</h1>

            <form onsubmit={handleSignUp} class="mt-3">
              <div class="mb-3">
                <label for="username" class="form-label text-white"
                  >Username</label
                >
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  name="username"
                  placeholder="your username"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="password" class="form-label text-white"
                  >Password</label
                >
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  name="password"
                  placeholder="password"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="confirm-password" class="form-label text-white"
                  >Confirm Password</label
                >
                <input
                  type="password"
                  class="form-control"
                  id="confirm-password"
                  placeholder="confirm password"
                  name="confirmPassword"
                  required
                />
              </div>

              <div class="d-grid">
                <button class="btn btn-spotify btn-lg" type="submit"
                  >Sign Up</button
                >
              </div>
            </form>
          </div>
        </div>

        <!-- Login link -->
        <p class="text-center text-white-50 mt-3">
          Already have an account?
          <a class="link-light" href="/login">Log in to Soundify</a>
        </p>
      </div>
    </div>
  </main>

  <script
    src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
  ></script>
</div>

<style>
  :root {
    --spotify: #1db954;
  }
  .logo-dot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--spotify);
    color: #121212;
    margin-right: 0.5rem;
  }
  .brand {
    font-weight: 700;
    letter-spacing: 0.5px;
  }
  .card-login {
    background: #181818;
    border: 1px solid #282828;
    border-radius: 1rem;
  }
  .form-control {
    background-color: #2a2a2a;
    border-color: #3a3a3a;
    color: #fff;
  }
  .form-control:focus {
    background-color: #2d2d2d;
    border-color: var(--spotify);
    box-shadow: 0 0 0 0.25rem rgba(29, 185, 84, 0.25);
    color: #fff;
  }
  .btn-spotify {
    background-color: var(--spotify);
    border-color: var(--spotify);
    color: #121212;
    font-weight: 600;
  }
  .btn-spotify:hover {
    background-color: #19a84c;
    border-color: #19a84c;
    color: #121212;
  }

  a.link-light {
    color: #fff;
  }
</style>

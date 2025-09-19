<div class="container-fluid">
    <div class="row">
        <!-- Sidebar -->
        <nav
            class="col-md-3 col-lg-2 d-md-block bg-dark sidebar py-4"
            style="min-height: 100vh;"
        >
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
                        <a
                            class="nav-link d-flex align-items-center text-white"
                            href="/"
                        >
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
                        <a
                            class="nav-link d-flex align-items-center text-white"
                            href="/"
                        >
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
                        <a
                            class="nav-link d-flex align-items-center text-white"
                            href="/"
                        >
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
            <h1 class="mb-4 mt-4">After Hours</h1>
            <table class="table table-dark table-hover rounded over">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Artist</th>
                        <th>Album</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>Blinding Lights</td>
                        <td>The Weeknd</td>
                        <td>After Hours</td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>Save Your Tears</td>
                        <td>The Weeknd</td>
                        <td>After Hours</td>
                    </tr>
                </tbody>
            </table>
        </main>
    </div>
</div>

<style>

    .sidebar {
        background: #181818;
    }
    .sidebar .nav-link.active,
    .sidebar .nav-link:hover {
        background: #1db954;
        color: #fff !important;
    }
    .sidebar .nav-link {
        color: #b3b3b3;
        border-radius: 8px;
        transition:
            background 0.2s,
            color 0.2s;
    }
    .sidebar h4 {
        color: #1db954;
    }
    main h1 {
        color: #1db954;
    }
</style>

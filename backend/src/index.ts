import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import axios from 'axios'
import rateLimit from 'express-rate-limit';
import { doubleCsrf } from "csrf-csrf";

import User from "./models/User";
import UserProfile from "./models/UserProfile";
import Playlist from "./models/Playlist";
import { encode, decode } from "./token";

const app = express();

// When running behind a reverse proxy (nginx), enable trust proxy so that
// Express / express-rate-limit can correctly use X-Forwarded-* headers.
// Configure via TRUST_PROXY (e.g. "1", "true", or a hop count like "2").
const trustProxyEnv = process.env.TRUST_PROXY;
if (typeof trustProxyEnv === "string" && trustProxyEnv.length > 0) {
  const normalized = trustProxyEnv.trim().toLowerCase();
  if (["0", "false", "off", "no"].includes(normalized)) {
    app.set("trust proxy", false);
  } else if (["1", "true", "on", "yes"].includes(normalized)) {
    app.set("trust proxy", 1);
  } else {
    const asNumber = Number(normalized);
    if (Number.isFinite(asNumber)) {
      app.set("trust proxy", asNumber);
    } else {
      // Allow Express' string formats (e.g. "loopback", "uniquelocal").
      app.set("trust proxy", trustProxyEnv);
    }
  }
}

app.use(express.json());
app.use(cookieParser());

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: "Too many authentication attempts, please try again later."
});

// CSRF protection
const csrfProtection = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || "default-csrf-secret",
  cookieName: "x-csrf-token",
  cookieOptions: {
    sameSite: "strict",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getSessionIdentifier: (req) => {
    // Use a stable per-user identifier (JWT cookie) to bind CSRF tokens.
    return req.cookies.token || "anonymous";
  },
});

const doubleCsrfProtection = csrfProtection.doubleCsrfProtection;

// Apply rate limiting to backend routes.
// Note: nginx rewrites /api/* to /* before proxying, so the backend typically
// does not see the /api prefix.
app.use(apiLimiter);

const port = 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/soundify";
const CLIENT_ID = process.env.PUBLIC_SPOTIFY_CLIENT_ID || "";
const CLIENT_SECRET = process.env.PUBLIC_SPOTIFY_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.PUBLIC_SPOTIFY_REDIRECT_URI || "";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// app.post("/register", async (req, res) => {
//   const { username, password }: { username: string; password: string } =
//     req.body;

//   if (!username || !password) {
//     return res
//       .status(400)
//       .json({ message: "Username and password are required" });
//   }

//   try {
//     const newUser = new User({ username, password });
//     await newUser.save();
//     const token = encode({username});
//     res.cookie("token", token);
//     return res.status(201).json({ message: "User created successfully" });
//   } catch (err: any) {
//     if (err.code === 11000) {
//       return res.status(409).json({ message: "Username already exists" });
//     }
//     return res.status(500).json({ message: "Internal server error" });
//   }
// });

// app.post("/login", async (req, res) => {
//   const { username, password }: { username: string; password: string } = req.body;

//   if (!username || !password) {
//     return res.status(400).json({ message: "Username and password are required" });
//   }

//   try {
//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid username or password" });
//     }

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid username or password" });
//     }

//     const token = encode({username});
//     res.cookie("token", token);

//     return res.status(200).json({ message: "Login successful" });
//   } catch (err: any) {
//     return res.status(500).json({ message: "Internal server error" });
//   }
// });

// Middleware to authenticate requests
const authenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const decoded = decode(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid token" });
  }
  
  req.user = decoded;
  next();
};

// Provide CSRF token + cookie for SPA clients.
// Frontend should call /api/csrf-token and include the returned value in the
// `x-csrf-token` header for mutating requests.
app.get("/csrf-token", authenticate, (req, res) => {
  const csrfToken = csrfProtection.generateCsrfToken(req, res);
  res.json({ csrfToken });
});

app.get("/oauth2", authLimiter, async (req, res) => {
  const { code } = req.query as { code?: string };

  if (!code) {
    return res.status(400).json({ message: "Authorization code is required" });
  }

  const url = "https://accounts.spotify.com/api/token";

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  });

  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  try {
    const response = await axios.post(url, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basicAuth}`,
      },
    });

    const { access_token, refresh_token, expires_in, scope, token_type } = response.data;

    const details = await axios.get("https://api.spotify.com/v1/me", {headers:{ Authorization: `Bearer ${access_token}`}})
    console.log(details)
    const {display_name, email, images} = details.data;
    console.log(images)

    // Store or update user profile in database
    await UserProfile.findOneAndUpdate(
      { email },
      {
        email,
        name: display_name,
        image: images.length ? images.at(-1)?.url : null,
        spotifyAccessToken: access_token,
        spotifyRefreshToken: refresh_token
      },
      { upsert: true, new: true }
    );

    const token_payload = { name: display_name, email, image: images.length ? images.at(-1)?.url : null, token: access_token}
    const token = encode(token_payload)

    res.cookie("token", token)
    return res.redirect("/dashboard");
  } catch (err: any) {
    console.error("Token exchange failed:", err.response?.data || err.message);
    return res.status(500).json({ message: "Failed to exchange authorization code" });
  }
});

// Return the current authenticated user (for CSR clients)
const getMeHandler = (req: any, res: any) => {
  const { name, email, image } = req.user ?? {};
  res.json({ user: { name, email, image } });
};

app.get("/me", authenticate, getMeHandler);
app.get("/api/me", authenticate, getMeHandler);

// Get user's Spotify saved tracks (paged)
// Spotify endpoint supports limit/offset and returns a `total` count.
const getSavedTracksHandler = async (req: any, res: any) => {
  try {
    const { token } = req.user;
    const rawLimit = typeof req.query.limit === "string" ? req.query.limit : undefined;
    const rawOffset = typeof req.query.offset === "string" ? req.query.offset : undefined;

    const limit = Math.min(Math.max(Number.parseInt(rawLimit ?? "50", 10) || 50, 1), 50);
    const offset = Math.max(Number.parseInt(rawOffset ?? "0", 10) || 0, 0);

    const response = await axios.get("https://api.spotify.com/v1/me/tracks", {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit, offset }
    });

    const total = typeof response.data?.total === "number" ? response.data.total : 0;

    const tracks = response.data.items.map((item: any) => ({
      spotifyId: item.track.id,
      name: item.track.name,
      artist: item.track.artists.map((a: any) => a.name).join(", "),
      album: item.track.album.name,
      duration: item.track.duration_ms,
      imageUrl: item.track.album.images[0]?.url,
      savedAt: item.added_at
    }));

    res.json({ tracks, total, limit, offset });
  } catch (err: any) {
    console.error("Failed to fetch saved tracks:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch saved tracks" });
  }
};

app.get("/spotify/saved-tracks", authenticate, getSavedTracksHandler);
app.get("/api/spotify/saved-tracks", authenticate, getSavedTracksHandler);

// Search songs on Spotify
const searchSpotifyHandler = async (req: any, res: any) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }

    const { token } = req.user;
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${token}` },
      params: { q, type: "track", limit: 20 }
    });

    const tracks = response.data.tracks.items.map((track: any) => ({
      spotifyId: track.id,
      name: track.name,
      artist: track.artists.map((a: any) => a.name).join(", "),
      album: track.album.name,
      duration: track.duration_ms,
      imageUrl: track.album.images[0]?.url
    }));

    res.json({ tracks });
  } catch (err: any) {
    console.error("Search failed:", err.response?.data || err.message);
    res.status(500).json({ message: "Search failed" });
  }
};

app.get("/spotify/search", authenticate, searchSpotifyHandler);
app.get("/api/spotify/search", authenticate, searchSpotifyHandler);

// Create a new playlist
app.post("/playlists", authenticate, doubleCsrfProtection, async (req: any, res) => {
  try {
    const { name, description, isPublic } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Playlist name is required" });
    }

    const playlist = new Playlist({
      name,
      description,
      owner: req.user.email,
      isPublic: isPublic !== false,
      tracks: []
    });

    await playlist.save();
    res.status(201).json({ playlist });
  } catch (err: any) {
    console.error("Failed to create playlist:", err.message);
    res.status(500).json({ message: "Failed to create playlist" });
  }
});

// Get user's playlists
app.get("/playlists", authenticate, async (req: any, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user.email }).sort({ updatedAt: -1 });
    res.json({ playlists });
  } catch (err: any) {
    console.error("Failed to fetch playlists:", err.message);
    res.status(500).json({ message: "Failed to fetch playlists" });
  }
});

// Get a specific playlist
app.get("/playlists/:id", authenticate, async (req: any, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check if user has access (owner or public)
    if (!playlist.isPublic && playlist.owner !== req.user.email) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ playlist });
  } catch (err: any) {
    console.error("Failed to fetch playlist:", err.message);
    res.status(500).json({ message: "Failed to fetch playlist" });
  }
});

// Update a playlist
app.put("/playlists/:id", authenticate, doubleCsrfProtection, async (req: any, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.owner !== req.user.email) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, description, isPublic } = req.body;
    if (name !== undefined) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;

    await playlist.save();
    res.json({ playlist });
  } catch (err: any) {
    console.error("Failed to update playlist:", err.message);
    res.status(500).json({ message: "Failed to update playlist" });
  }
});

// Delete a playlist
app.delete("/playlists/:id", authenticate, doubleCsrfProtection, async (req: any, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.owner !== req.user.email) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Playlist.findByIdAndDelete(req.params.id);
    res.json({ message: "Playlist deleted" });
  } catch (err: any) {
    console.error("Failed to delete playlist:", err.message);
    res.status(500).json({ message: "Failed to delete playlist" });
  }
});

// Add tracks to a playlist
app.post("/playlists/:id/tracks", authenticate, doubleCsrfProtection, async (req: any, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.owner !== req.user.email) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { track } = req.body;
    if (!track || !track.spotifyId) {
      return res.status(400).json({ message: "Invalid track data" });
    }

    playlist.tracks.push({ ...track, addedAt: new Date() });
    await playlist.save();
    
    res.json({ playlist });
  } catch (err: any) {
    console.error("Failed to add track:", err.message);
    res.status(500).json({ message: "Failed to add track" });
  }
});

// Remove track from playlist
app.delete("/playlists/:id/tracks/:trackId", authenticate, doubleCsrfProtection, async (req: any, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.owner !== req.user.email) {
      return res.status(403).json({ message: "Access denied" });
    }

    playlist.tracks = playlist.tracks.filter(
      (track) => track.spotifyId !== req.params.trackId
    );
    await playlist.save();
    
    res.json({ playlist });
  } catch (err: any) {
    console.error("Failed to remove track:", err.message);
    res.status(500).json({ message: "Failed to remove track" });
  }
});

// Search users
app.get("/users/search", authenticate, async (req: any, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }

    const users = await UserProfile.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).select('name email image').limit(20);

    res.json({ users });
  } catch (err: any) {
    console.error("User search failed:", err.message);
    res.status(500).json({ message: "User search failed" });
  }
});

// Get user's public playlists
app.get("/users/:email/playlists", authenticate, async (req: any, res) => {
  try {
    const playlists = await Playlist.find({ 
      owner: req.params.email, 
      isPublic: true 
    }).sort({ updatedAt: -1 });
    
    res.json({ playlists });
  } catch (err: any) {
    console.error("Failed to fetch user playlists:", err.message);
    res.status(500).json({ message: "Failed to fetch user playlists" });
  }
});

// Like a playlist
app.post("/playlists/:id/like", authenticate, doubleCsrfProtection, async (req: any, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (!playlist.isPublic && playlist.owner !== req.user.email) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!playlist.likes.includes(req.user.email)) {
      playlist.likes.push(req.user.email);
      await playlist.save();
    }

    res.json({ playlist });
  } catch (err: any) {
    console.error("Failed to like playlist:", err.message);
    res.status(500).json({ message: "Failed to like playlist" });
  }
});

// Unlike a playlist
app.delete("/playlists/:id/like", authenticate, doubleCsrfProtection, async (req: any, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    playlist.likes = playlist.likes.filter(email => email !== req.user.email);
    await playlist.save();

    res.json({ playlist });
  } catch (err: any) {
    console.error("Failed to unlike playlist:", err.message);
    res.status(500).json({ message: "Failed to unlike playlist" });
  }
});

// Get public playlists (discover) - sorted by number of likes
app.get("/discover/playlists", authenticate, async (req: any, res) => {
  try {
    const playlists = await Playlist.aggregate([
      { $match: { isPublic: true } },
      {
        $addFields: {
          likeCount: { $size: "$likes" }
        }
      },
      { $sort: { likeCount: -1, updatedAt: -1 } },
      { $limit: 50 }
    ]);
    
    res.json({ playlists });
  } catch (err: any) {
    console.error("Failed to fetch playlists:", err.message);
    res.status(500).json({ message: "Failed to fetch playlists" });
  }
});

// Search playlists by name
app.get("/playlists/search", authenticate, async (req: any, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }

    const playlists = await Playlist.find({
      isPublic: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    }).limit(20);
    
    res.json({ playlists });
  } catch (err: any) {
    console.error("Playlist search failed:", err.message);
    res.status(500).json({ message: "Playlist search failed" });
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

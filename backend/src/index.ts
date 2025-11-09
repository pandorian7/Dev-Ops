import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import axios from 'axios'

import User from "./models/User";
import { encode } from "./token";

const app = express();

app.use(express.json());
app.use(cookieParser());

const port = 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/soundify";
const CLIENT_ID = process.env.PUBLIC_SPOTIFY_CLIENT_ID || "";
const CLIENT_SECRET = process.env.PUBLIC_SPOTIFY_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.PUBLIC_SPOTIFY_REDIRECT_URI || "";

// mongoose.connect(MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch(err => console.error("MongoDB connection error:", err));

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

app.get("/oauth2", async (req, res) => {
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

    const token_payload = { name: display_name, email, image: images.length ? images.at(-1)?.url : null, token: access_token}
    const token = encode(token_payload)

    res.cookie("token", token)
    return res.redirect("/dashboard");
  } catch (err: any) {
    console.error("Token exchange failed:", err.response?.data || err.message);
    return res.status(500).json({ message: "Failed to exchange authorization code" });
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

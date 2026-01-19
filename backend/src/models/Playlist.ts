import mongoose, { Document } from 'mongoose';

export interface ITrack {
  spotifyId: string;
  name: string;
  artist: string;
  album?: string;
  duration?: number;
  imageUrl?: string;
  addedAt: Date;
}

export interface IPlaylist extends Document {
  name: string;
  description?: string;
  owner: string; // email of the user
  tracks: ITrack[];
  isPublic: boolean;
  likes: string[]; // array of user emails who liked
  createdAt: Date;
  updatedAt: Date;
}

const trackSchema = new mongoose.Schema({
  spotifyId: { type: String, required: true },
  name: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String },
  duration: { type: Number },
  imageUrl: { type: String },
  addedAt: { type: Date, default: Date.now }
});

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  owner: { type: String, required: true },
  tracks: [trackSchema],
  isPublic: { type: Boolean, default: true },
  likes: [{ type: String }]
}, { timestamps: true });

const Playlist = mongoose.model<IPlaylist>('Playlist', playlistSchema);
export default Playlist;

import mongoose, { Document } from 'mongoose';

export interface IUserProfile extends Document {
  email: string;
  name: string;
  image?: string;
  spotifyAccessToken?: string;
  spotifyRefreshToken?: string;
  savedTracks: {
    spotifyId: string;
    name: string;
    artist: string;
    album?: string;
    duration?: number;
    imageUrl?: string;
    savedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const savedTrackSchema = new mongoose.Schema({
  spotifyId: { type: String, required: true },
  name: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String },
  duration: { type: Number },
  imageUrl: { type: String },
  savedAt: { type: Date, default: Date.now }
});

const userProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true },
  image: { type: String },
  spotifyAccessToken: { type: String },
  spotifyRefreshToken: { type: String },
  savedTracks: [savedTrackSchema]
}, { timestamps: true });

const UserProfile = mongoose.model<IUserProfile>('UserProfile', userProfileSchema);
export default UserProfile;

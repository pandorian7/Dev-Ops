import axios from "axios";

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000';

async function register(username: string, password: string) {
  const res = await axios.post(`${API_URL}/api/register`, { username, password });
}

async function login(username: string, password: string) {
  const res = await axios.post(`${API_URL}/api/login`, {username, password})
}

export const auth = {
  register, login
};

// Spotify API
export const spotify = {
  async getSavedTracks() {
    const res = await axios.get(`${API_URL}/api/spotify/saved-tracks`);
    return res.data;
  },
  
  async searchTracks(query: string) {
    const res = await axios.get(`${API_URL}/api/spotify/search`, { params: { q: query } });
    return res.data;
  }
};

// Playlist API
export const playlists = {
  async create(name: string, description?: string, isPublic?: boolean) {
    const res = await axios.post(`${API_URL}/api/playlists`, { name, description, isPublic });
    return res.data;
  },
  
  async getAll() {
    const res = await axios.get(`${API_URL}/api/playlists`);
    return res.data;
  },
  
  async getById(id: string) {
    const res = await axios.get(`${API_URL}/api/playlists/${id}`);
    return res.data;
  },
  
  async update(id: string, data: { name?: string; description?: string; isPublic?: boolean }) {
    const res = await axios.put(`${API_URL}/api/playlists/${id}`, data);
    return res.data;
  },
  
  async delete(id: string) {
    const res = await axios.delete(`${API_URL}/api/playlists/${id}`);
    return res.data;
  },
  
  async addTrack(id: string, track: any) {
    const res = await axios.post(`${API_URL}/api/playlists/${id}/tracks`, { track });
    return res.data;
  },
  
  async removeTrack(id: string, trackId: string) {
    const res = await axios.delete(`${API_URL}/api/playlists/${id}/tracks/${trackId}`);
    return res.data;
  },
  
  async like(id: string) {
    const res = await axios.post(`${API_URL}/api/playlists/${id}/like`);
    return res.data;
  },
  
  async unlike(id: string) {
    const res = await axios.delete(`${API_URL}/api/playlists/${id}/like`);
    return res.data;
  },
  
  async getDiscover() {
    const res = await axios.get(`${API_URL}/api/discover/playlists`);
    return res.data;
  }
};

// Users API
export const users = {
  async search(query: string) {
    const res = await axios.get(`${API_URL}/api/users/search`, { params: { q: query } });
    return res.data;
  },
  
  async getPlaylists(email: string) {
    const res = await axios.get(`${API_URL}/api/users/${encodeURIComponent(email)}/playlists`);
    return res.data;
  }
};


import axios from "axios";

// For client-side, API requests are made to the same origin
// The backend is proxied through the SvelteKit server
const API_URL = '';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let cachedCsrfToken: string | null = null;

async function ensureCsrfToken() {
  if (cachedCsrfToken) return cachedCsrfToken;
  const res = await api.get(`/api/csrf-token`);
  cachedCsrfToken = res.data?.csrfToken;
  if (cachedCsrfToken) {
    api.defaults.headers.common['x-csrf-token'] = cachedCsrfToken;
  }
  return cachedCsrfToken;
}

async function register(username: string, password: string) {
  await ensureCsrfToken();
  const res = await api.post(`/api/register`, { username, password });
}

async function login(username: string, password: string) {
  await ensureCsrfToken();
  const res = await api.post(`/api/login`, {username, password})
}

export const auth = {
  register, login
};

// Spotify API
export const spotify = {
  async getSavedTracks(params?: { limit?: number; offset?: number }) {
    const res = await api.get(`/api/spotify/saved-tracks`, { params });
    return res.data;
  },
  
  async searchTracks(query: string) {
    const res = await api.get(`/api/spotify/search`, { params: { q: query } });
    return res.data;
  }
};

// Playlist API
export const playlists = {
  async create(name: string, description?: string, isPublic?: boolean) {
    await ensureCsrfToken();
    const res = await api.post(`/api/playlists`, { name, description, isPublic });
    return res.data;
  },
  
  async getAll() {
    const res = await api.get(`/api/playlists`);
    return res.data;
  },
  
  async getById(id: string) {
    const res = await api.get(`/api/playlists/${id}`);
    return res.data;
  },
  
  async update(id: string, data: { name?: string; description?: string; isPublic?: boolean }) {
    await ensureCsrfToken();
    const res = await api.put(`/api/playlists/${id}`, data);
    return res.data;
  },
  
  async delete(id: string) {
    await ensureCsrfToken();
    const res = await api.delete(`/api/playlists/${id}`);
    return res.data;
  },
  
  async addTrack(id: string, track: any) {
    await ensureCsrfToken();
    const res = await api.post(`/api/playlists/${id}/tracks`, { track });
    return res.data;
  },
  
  async removeTrack(id: string, trackId: string) {
    await ensureCsrfToken();
    const res = await api.delete(`/api/playlists/${id}/tracks/${trackId}`);
    return res.data;
  },
  
  async like(id: string) {
    await ensureCsrfToken();
    const res = await api.post(`/api/playlists/${id}/like`, {});
    return res.data;
  },
  
  async unlike(id: string) {
    await ensureCsrfToken();
    const res = await api.delete(`/api/playlists/${id}/like`);
    return res.data;
  },
  
  async getDiscover() {
    const res = await api.get(`/api/discover/playlists`);
    return res.data;
  },
  
  async search(query: string) {
    const res = await api.get(`/api/playlists/search`, { params: { q: query } });
    return res.data;
  }
};

// Users API
export const users = {
  async search(query: string) {
    const res = await api.get(`/api/users/search`, { params: { q: query } });
    return res.data;
  },
  
  async getPlaylists(email: string) {
    const res = await api.get(`/api/users/${encodeURIComponent(email)}/playlists`);
    return res.data;
  }
};


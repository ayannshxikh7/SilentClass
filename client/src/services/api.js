import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
});

export const authApi = {
  login: async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    return data;
  },
  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },
  forgotPassword: async (payload) => {
    const { data } = await api.post('/auth/forgot-password', payload);
    return data;
  },
  getProfile: async (token) => {
    const { data } = await api.get('/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
    return data;
  },
  updateProfile: async (token, payload) => {
    const { data } = await api.put('/auth/profile', payload, { headers: { Authorization: `Bearer ${token}` } });
    return data;
  }
};

export const notesApi = {
  getDashboard: async (token, params = {}) => {
    const { data } = await api.get('/notes/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
    return data;
  },
  summarize: async (token, payload) => {
    const { data } = await api.post('/notes/summarize', payload, { headers: { Authorization: `Bearer ${token}` } });
    return data;
  },
  previewTranscript: async (token, videoUrl) => {
    const { data } = await api.post(
      '/notes/transcript/preview',
      { videoUrl },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  },
  uploadPdf: async (token, file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    const { data } = await api.post('/notes/upload/pdf', formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  uploadVideo: async (token, file) => {
    const formData = new FormData();
    formData.append('video', file);
    const { data } = await api.post('/notes/upload/video', formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  uploadAudio: async (token, file) => {
    const formData = new FormData();
    formData.append('audio', file);
    const { data } = await api.post('/notes/upload/audio', formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  toggleFavorite: async (token, id) => {
    const { data } = await api.patch(`/notes/${id}/favorite`, {}, { headers: { Authorization: `Bearer ${token}` } });
    return data;
  },
  updateMeta: async (token, id, payload) => {
    const { data } = await api.patch(`/notes/${id}/meta`, payload, { headers: { Authorization: `Bearer ${token}` } });
    return data;
  }
};

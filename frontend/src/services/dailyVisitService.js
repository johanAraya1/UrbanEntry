import api from './api';

const dailyVisitService = {
  list: async () => {
    console.log('📅 Fetching daily visits list');
    const response = await api.get('/visits');
    return response.data;
  },

  create: async (data) => {
    console.log('🚀 Creating daily visit:', data);
    const response = await api.post('/visits', data);
    return response.data;
  },

  update: async (id, data) => {
    console.log('🔄 Updating daily visit:', id, data);
    const response = await api.put(`/visits/${id}`, data);
    return response.data;
  },

  remove: async (id) => {
    console.log('🗑️ Deleting daily visit:', id);
    const response = await api.delete(`/visits/${id}`);
    console.log('✅ Daily visit deleted');
    return response.data;
  },
};

export default dailyVisitService;

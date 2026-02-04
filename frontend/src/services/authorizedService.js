import api from './api';

const list = async (params = {}) => {
  const res = await api.get('/authorized', { params });
  return res.data;
};

const create = async (data) => {
  console.log('🚀 Creating authorized person:', data);
  const res = await api.post('/authorized', data);
  console.log('✅ Authorized person created:', res.data);
  return res.data;
};

const update = async (id, data) => {
  console.log('🔄 Updating authorized person:', id, data);
  const res = await api.put(`/authorized/${id}`, data);
  console.log('✅ Authorized person updated:', res.data);
  return res.data;
};

const remove = async (id) => {
  console.log('🗑️ Deleting authorized person:', id);
  await api.delete(`/authorized/${id}`);
  console.log('✅ Authorized person deleted');
};

export default { list, create, update, remove };

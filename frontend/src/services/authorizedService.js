import api from './api';

const list = async (params = {}) => {
  const res = await api.get('/authorized', { params });
  return res.data;
};

export default { list };

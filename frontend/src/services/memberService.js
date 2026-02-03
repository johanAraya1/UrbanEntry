import api from './api';

const getMembers = async () => {
  try {
    const res = await api.get('/admin/members');
    return res.data;
  } catch (error) {
    console.error('Error fetching members:', error.response?.data || error.message);
    throw error;
  }
};

const createMember = async (memberData) => {
  try {
    const res = await api.post('/admin/members', memberData);
    return res.data;
  } catch (error) {
    console.error('Error creating member:', error.response?.data || error.message);
    throw error;
  }
};

const deleteMember = async (memberId) => {
  try {
    console.log('🚀 Sending DELETE request for member ID:', memberId);
    const res = await api.delete(`/admin/members/${memberId}`);
    console.log('✅ DELETE response:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Error deleting member:', error);
    console.error('❌ Error response data:', error.response?.data);
    console.error('❌ Error response status:', error.response?.status);
    throw error;
  }
};

export default { getMembers, createMember, deleteMember };

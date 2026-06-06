import api from './axios.js';

/** Thin admin API wrapper used by the admin dashboard. */
export const adminApi = {
  getStats: () => api.get('/admin/stats').then((r) => r.data.data.stats),
  listUsers: (params) => api.get('/admin/users', { params }).then((r) => r.data.data),
  updateRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data.data.user),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
};

export default adminApi;

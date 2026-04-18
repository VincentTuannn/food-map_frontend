// src/api/services/admin.ts
import { apiFetch } from '../http';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const adminApi = {
  
  // 1. DASHBOARD (TỔNG QUAN)
  getDashboardStats: () => apiFetch<any>('/admin/dashboard'),

  // 2. USERS (KHÁCH DU LỊCH) & 4. ADMINS (QUẢN TRỊ VIÊN)
  getUsers: (role?: string, search?: string, page = 1) => {
    const query = new URLSearchParams({
      role: role || '',
      search: search || '',
      page: String(page),
      limit: '10'
    }).toString();
    return apiFetch<any>(`/admin/users?${query}`);
  },

  updateUser: (id: string, data: { role?: string; is_premium?: boolean; current_tier?: string }) => 
    apiFetch(`/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    }),

  deleteUser: (id: string) => apiFetch(`/admin/users/${id}`, { method: 'DELETE' }),

  // [MODULE 10] - ĐẶC QUYỀN TẠO ADMIN
  createAdmin: (data: { email: string; password: string }) => 
    apiFetch('/admin/create-admin', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    }),

  // 3. MERCHANTS (ĐỐI TÁC)
  getMerchants: (search?: string, status?: string, page = 1) => {
    const query = new URLSearchParams({
      search: search || '',
      subscription_status: status || '',
      page: String(page),
      limit: '10'
    }).toString();
    return apiFetch<any>(`/admin/merchants?${query}`);
  },

  updateMerchant: (id: string, subscription_status: string) => 
    apiFetch(`/admin/merchants/${id}/status`, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify({ subscription_status }),
    }),

  deleteMerchant: (id: string) => apiFetch(`/admin/merchants/${id}`, { method: 'DELETE' }),

  // 5. POIS (DANH SÁCH ĐỊA ĐIỂM CHUNG)
  getPois: (status?: string, search?: string) => {
    const query = new URLSearchParams({
      status: status || '',
      search: search || ''
    }).toString();
    return apiFetch<any>(`/admin/pois?${query}`);
  },

  // ✅ HÀM LẤY ĐỊA ĐIỂM CHỜ DUYỆT (ĐÃ FIX LỖI)
  getPendingPOIs: () => apiFetch<any>('/admin/pois/pending'),

  updatePoiStatus: (id: string, status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REJECTED') => 
    apiFetch(`/admin/pois/${id}/status`, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify({ status }),
    }),

  deletePoi: (id: string) => apiFetch(`/admin/pois/${id}`, { method: 'DELETE' }),

  // Admin Create POI (admin tạo POI trực tiếp, không cần merchant)
  createPoi: (data: { name: string; lat: number; lng: number; trigger_radius?: number; status?: string }) =>
    apiFetch('/admin/pois', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    }),

  // Admin Update POI (sửa tên, tọa độ, trạng thái)
  updatePoi: (id: string, data: { name?: string; lat?: number; lng?: number; trigger_radius?: number; status?: string }) =>
    apiFetch(`/admin/pois/${id}`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    }),

  // 6. REVIEWS (KIỂM DUYỆT ĐÁNH GIÁ)
  getReviews: (page = 1) => apiFetch<any>(`/admin/reviews?page=${page}&limit=10`),
  
  deleteReview: (id: string) => apiFetch(`/admin/reviews/${id}`, { method: 'DELETE' }),

  // 7. TOURS (TUYẾN ĐƯỜNG)
  getTours: () => apiFetch<any>('/admin/tours'),

  createTour: (data: { name: string; description?: string; poi_ids: string[] }) => 
    apiFetch('/admin/tours', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    }),

  deleteTour: (id: string) => apiFetch(`/admin/tours/${id}`, { method: 'DELETE' }),

  // Admin Update Tour (sửa tên, mô tả, sắp xếp lại POIs)
  updateTour: (id: string, data: { name?: string; description?: string; poi_ids?: string[] }) =>
    apiFetch(`/admin/tours/${id}`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    }),

  // 8. PROMOTIONS (MÃ KHUYẾN MÃI)
  getPromotions: () => apiFetch<any>('/admin/promotions'),
  
  deletePromotion: (id: string) => apiFetch(`/admin/promotions/${id}`, { method: 'DELETE' }),

  // 9. TRANSACTIONS (ĐỐI SOÁT DÒNG TIỀN)
  getTransactions: (status?: string, type?: string) => {
    const query = new URLSearchParams({
      status: status || '',
      actor_type: type || ''
    }).toString();
    return apiFetch<any>(`/admin/transactions?${query}`);
  },

  // 10. TRACKING LOGS (NHẬT KÝ HỆ THỐNG)
  getTrackingLogs: (event_type?: string) => 
    apiFetch<any>(`/admin/tracking-logs?event_type=${event_type || ''}`),

  // 11. ACTIVE USERS (THỐNG KÊ THIẾT BỊ ĐANG HOẠT ĐỘNG)
  getActiveUsers: () => apiFetch<any>('/admin/active-users'),
};
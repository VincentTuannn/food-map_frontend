import { useState, useEffect } from 'react';
import { adminApi } from '../../api/services/admin';
import { useAppStore } from '../../shared/store/appStore';

export function AdminDevices() {
  const showToast = useAppStore((s) => s.showToast);
  
  // States dữ liệu
  const [devices, setDevices] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Tải danh sách người dùng và trích xuất thiết bị
  const loadDevices = async () => {
    setIsFetching(true);
    try {
      // Lấy toàn bộ user để xem ai đang kết nối (có device_id)
      const res = await adminApi.getUsers('', searchQuery);
      const allUsers = Array.isArray(res) ? res : res?.data || [];
      
      // Lọc ra các user có thiết bị và map dữ liệu để hiển thị
      const connectedDevices = allUsers
        .filter((u: any) => u.device_id || u.email) // Giả lập nếu không có device_id thì lấy email làm danh tính
        .map((u: any) => ({
          id: u.id,
          deviceId: u.device_id || `DVC-${u.id.substring(0, 8).toUpperCase()}`,
          userEmail: u.email,
          role: u.role,
          lastActive: u.updated_at || u.created_at || new Date().toISOString(),
          status: 'ĐANG KẾT NỐI',
        }));
        
      setDevices(connectedDevices);
    } catch (error) {
      showToast({ title: '❌ Lỗi tải danh sách thiết bị' });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadDevices();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="animate-fadeIn">
      {/* HEADER & FILTER */}
      <div className="bg-white/90 shadow-lg rounded-xl px-6 py-5 mb-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-amber-900 text-xl font-bold m-0 flex items-center gap-2">
          📱 Quản lý Thiết bị kết nối
        </h2>
        <div className="flex gap-3 w-full md:w-auto">
          <input 
            className="input w-full md:w-64" 
            placeholder="Tìm theo mã thiết bị hoặc email..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button className="btn btnPrimary whitespace-nowrap" onClick={loadDevices}>
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* DEVICES TABLE */}
      <div className="bg-white/90 shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-gray-700">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-sm uppercase tracking-wider">
                <th className="p-4">Mã Thiết bị (Device ID)</th>
                <th className="p-4">Tài khoản liên kết</th>
                <th className="p-4">Vai trò định danh</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Hoạt động cuối</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isFetching ? (
                <tr>
                  <td colSpan={5} className="text-center p-10 text-gray-400">
                    <span className="animate-pulse">⏳ Đang tổng hợp dữ liệu thiết bị...</span>
                  </td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-10 text-gray-400 italic">
                    Không có thiết bị nào đang kết nối.
                  </td>
                </tr>
              ) : (
                devices.map(device => (
                  <tr key={device.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono text-sm font-bold text-amber-800 bg-amber-100/50 inline-block px-2 py-1 rounded">
                        {device.deviceId}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{device.userEmail}</div>
                      <div className="text-xs text-gray-500">ID: {device.id.substring(0, 13)}...</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase ${
                        device.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {device.role || 'USER'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-green-100 text-green-700 flex items-center gap-1 w-max">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        {device.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm text-gray-600">
                        {new Date(device.lastActive).toLocaleString('vi-VN')}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

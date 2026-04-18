import { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../api/services/admin';
import { useAppStore } from '../../shared/store/appStore';

const POLLING_INTERVAL = 30_000; // 30 giây theo Sequence Diagram

export function AdminDevices() {
  const showToast = useAppStore((s) => s.showToast);

  // State: dữ liệu từ API /admin/active-users
  const [activeData, setActiveData] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Giai đoạn 2 (Sequence): Admin_UI -> Admin_API: GET /api/v1/admin/active-users
  const loadActiveUsers = async () => {
    try {
      const res = await adminApi.getActiveUsers();
      if (res.success && res.data) {
        setActiveData(res.data);
      } else {
        // Fallback: khi Backend trả về trực tiếp (không wrap trong .data)
        setActiveData(res.data || res);
      }
    } catch (error) {
      console.error('Lỗi polling active-users:', error);
      showToast({ title: ' Lỗi kết nối dữ liệu thiết bị' });
    } finally {
      setIsFetching(false);
    }
  };

  // Kích hoạt useEffect() -> loadActiveUsers() + Polling mỗi 30 giây
  useEffect(() => {
    loadActiveUsers();

    // Polling Background (mỗi 30 giây) theo Sequence Diagram
    pollingRef.current = setInterval(() => {
      loadActiveUsers();
    }, POLLING_INTERVAL);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const users = activeData?.users || [];
  const breakdown = activeData?.breakdown || { USER: 0, MERCHANT: 0, ADMIN: 0 };
  const totalOnline = activeData?.count || 0;

  return (
    <div className="animate-fadeIn">
      {/* HEADER: Thống kê nhanh */}
      <div className="bg-white/90 shadow-lg rounded-xl px-6 py-5 mb-5">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <h2 className="text-amber-900 text-xl font-bold m-0 flex items-center gap-2">
            📱 Thiết bị đang kết nối
          </h2>
          <button
            className="btn btnPrimary whitespace-nowrap"
            style={{ color: 'black' }}
            onClick={loadActiveUsers}
          >
            Làm mới
          </button>
        </div>

        {/* Breakdown cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-green-700 text-2xl font-extrabold">{totalOnline}</div>
            <div className="text-green-600 text-xs font-semibold mt-1">Tổng đang online</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-blue-700 text-2xl font-extrabold">{breakdown.USER || 0}</div>
            <div className="text-blue-600 text-xs font-semibold mt-1">👤 Khách du lịch</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
            <div className="text-amber-700 text-2xl font-extrabold">{breakdown.MERCHANT || 0}</div>
            <div className="text-amber-600 text-xs font-semibold mt-1">🏪 Đối tác</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
            <div className="text-purple-700 text-2xl font-extrabold">{breakdown.ADMIN || 0}</div>
            <div className="text-purple-600 text-xs font-semibold mt-1">👑 Quản trị viên</div>
          </div>
        </div>

        <div className="text-gray-400 text-[11px] mt-3 text-right">
          Tự động cập nhật mỗi 30 giây • Đăng lần cuối: {new Date().toLocaleTimeString('vi-VN')}
        </div>
      </div>

      {/* DEVICES TABLE: Bảng chi tiết */}
      <div className="bg-white/90 shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-gray-700">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-sm uppercase tracking-wider">
                <th className="p-4">Mã Thiết bị</th>
                <th className="p-4">Tài khoản</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Thời gian online</th>
                <th className="p-4 text-right">Lần cuối tương tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isFetching ? (
                <tr>
                  <td colSpan={6} className="text-center p-10 text-gray-400">
                    <span className="animate-pulse">⏳ Đang truy vấn In-Memory Map...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-10 text-gray-400 italic">
                    Không có thiết bị nào đang trực tuyến.
                  </td>
                </tr>
              ) : (
                users.map((u: any) => {
                  const roleUpper = String(u.role || 'USER').toUpperCase();
                  const roleColors: Record<string, string> = {
                    ADMIN: 'bg-purple-100 text-purple-700',
                    MERCHANT: 'bg-amber-100 text-amber-700',
                    USER: 'bg-blue-100 text-blue-700',
                  };
                  return (
                    <tr key={u.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-mono text-sm font-bold text-amber-800 bg-amber-100/50 inline-block px-2 py-1 rounded">
                          {u.device_id || 'Web'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-800">{u.email}</div>
                        <div className="text-xs text-gray-500">ID: {u.id?.substring(0, 13)}...</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase ${roleColors[roleUpper] || roleColors.USER}`}>
                          {roleUpper}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-green-100 text-green-700 flex items-center gap-1 w-max">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          ĐANG KẾT NỐI
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-700 font-semibold">
                          {u.duration_minutes != null ? `${u.duration_minutes} phút` : 'N/A'}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="text-sm text-gray-600">
                          {u.last_seen ? new Date(u.last_seen).toLocaleString('vi-VN') : 'N/A'}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

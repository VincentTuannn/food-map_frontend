import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/services/admin';
import { useAppStore } from '../../shared/store/appStore';

export function AdminDashboard() {
  const showToast = useAppStore((s) => s.showToast);
  const navigate = useNavigate(); // Hook dùng để chuyển trang
  const [stats, setStats] = useState<any>(null);
  const [activeUsersStats, setActiveUsersStats] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);

  // Gọi api riêng biệt cho active users để setup polling
  const loadActiveUsers = async () => {
    try {
      const res = await adminApi.getActiveUsers();
      if (res.success && res.data) {
        setActiveUsersStats(res.data);
      }
    } catch (error) {
      // ignore silently for background polling
    }
  };
  const loadDashboard = async () => {
    setIsFetching(true);
    try {
      const res = await adminApi.getDashboardStats();
      
      if (res.success && res.data) {
        setStats({
          totalUsers: res.data.users || 0,
          totalMerchants: res.data.merchants || 0,
          totalPois: res.data.pois || 0,
          totalRevenue: res.data.revenue || 0, 
          totalReviews: res.data.reviews || 0,
          totalTours: res.data.tours || 0,
          totalPromotions: res.data.promotions || 0,
          totalTransactions: res.data.transactions || 0,
          newPoisLast7Days: res.data.newPoisLast7Days || 0,
          
          // Xử lý mảng trạng thái Địa điểm
          poisByStatus: (res.data.poi_statuses || []).reduce((acc: any, curr: any) => {
            acc[curr.status] = curr.count;
            return acc;
          }, {}),

          // Xử lý mảng trạng thái Đối tác (Đã fix lỗi chữ undefined)
          merchantsByStatus: (res.data.merchant_statuses || []).reduce((acc: any, curr: any) => {
            const statusName = curr.subscription_status || curr.status || 'Khác';
            acc[statusName] = curr.count;
            return acc;
          }, {})
        });
      } else {
         setStats(null);
      }
    } catch (error) {
      showToast({ title: '❌ Không thể tải dữ liệu thống kê' });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { 
    loadDashboard(); 
    loadActiveUsers(); // Tải ngay lần đầu
    
    // Polling active users mỗi 30 giây
    const interval = setInterval(loadActiveUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isFetching) return (
    <div className="text-gray-400 text-center py-20 animate-pulse select-none">
      ⏳ Đang tổng hợp số liệu hệ thống...
    </div>
  );

  // Thành phần thẻ chỉ số nhỏ (Đã thêm tính năng Click chuyển trang)
  // Map color prop to Tailwind classes
  const colorMap: Record<string, string> = {
    '#00C853': 'border-green-600 bg-green-50 text-green-700',
    '#7B2CBF': 'border-purple-700 bg-purple-50 text-purple-700',
    '#9D4EDD': 'border-purple-400 bg-purple-100 text-purple-700',
    '#C77DFF': 'border-fuchsia-400 bg-fuchsia-50 text-fuchsia-700',
  };
  const StatCard = ({ title, value, icon, color, path }: any) => {
    const colorClasses = colorMap[color] || 'border-gray-300 bg-gray-50 text-gray-700';
    return (
      <div
        className={`flex items-center gap-5 shadow-lg rounded-xl px-6 py-5 border-l-4 ${colorClasses} transition-all duration-200 hover:scale-[1.025] hover:shadow-2xl active:scale-100 ${path ? 'cursor-pointer' : 'cursor-default'} group animate-fadeIn`}
        onClick={() => path && navigate(path)}
      >
        <div className={`text-3xl p-2 rounded-xl mr-1 flex items-center justify-center bg-white/70`}>{icon}</div>
        <div>
          <div className="text-gray-400 text-xs font-semibold mb-1">{title}</div>
          <div className="text-amber-900 text-2xl font-extrabold tracking-tight group-hover:text-orange-600 transition-colors duration-200">
            {value?.toLocaleString() || 0}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      {/* 1. HÀNG ĐẦU: CÁC CON SỐ TỔNG QUÁT (Đã gắn link) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Nổi bật thẻ Active Users */}
        <StatCard title="Đang trực tuyến" value={activeUsersStats?.count || 0} icon="🟢" color="#00C853" path="/admin/active-users" />
        <StatCard title="Tổng Doanh thu" value={stats?.totalRevenue} icon="💰" color="#00C853" path="/admin/transactions" />
        <StatCard title="Khách du lịch" value={stats?.totalUsers} icon="👥" color="#7B2CBF" path="/admin/users" />
        <StatCard title="Đối tác (Merchant)" value={stats?.totalMerchants} icon="🏪" color="#9D4EDD" path="/admin/merchants" />
        <StatCard title="Địa điểm (POIs)" value={stats?.totalPois} icon="📍" color="#C77DFF" path="/admin/pois" />
      </div>

      {/* 2. HÀNG GIỮA: CHI TIẾT TRẠNG THÁI & TƯƠNG TÁC */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Thống kê POIs theo trạng thái */}
        <div className="bg-white/70 shadow-lg rounded-xl px-6 py-5 animate-fadeIn flex flex-col gap-2">
          <h3 className="text-amber-900 mb-3 text-base font-bold">📊 Trạng thái Địa điểm</h3>
          <div className="flex flex-col gap-2">
            {Object.entries(stats?.poisByStatus || {}).length > 0 ? (
              Object.entries(stats?.poisByStatus || {}).map(([status, count]: any) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-semibold">{status}</span>
                  <b className="text-amber-900 font-bold">{count}</b>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm italic">Chưa có dữ liệu trạng thái</div>
            )}
            <div className="mt-3 pt-3 border-t border-gray-200 text-orange-600 text-xs">
              ✨ <b>{stats?.newPoisLast7Days || 0}</b> địa điểm mới trong 7 ngày qua
            </div>
          </div>
        </div>

        {/* Thống kê Tương tác & Dữ liệu khác */}
        <div className="bg-white/70 shadow-lg rounded-xl px-6 py-5 animate-fadeIn">
          <h3 className="text-amber-900 mb-3 text-base font-bold">📈 Chỉ số tương tác</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="text-gray-500 text-[11px]">Đánh giá</div>
              <div className="text-amber-900 text-lg font-bold">{stats?.totalReviews}</div>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="text-gray-500 text-[11px]">Tuyến đường</div>
              <div className="text-amber-900 text-lg font-bold">{stats?.totalTours}</div>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="text-gray-500 text-[11px]">Khuyến mãi</div>
              <div className="text-amber-900 text-lg font-bold">{stats?.totalPromotions}</div>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="text-gray-500 text-[11px]">Giao dịch</div>
              <div className="text-amber-900 text-lg font-bold">{stats?.totalTransactions}</div>
            </div>
          </div>
        </div>

        {/* Trạng thái Đối tác */}
        <div className="bg-white/70 shadow-lg rounded-xl px-6 py-5 animate-fadeIn">
          <h3 className="text-amber-900 mb-3 text-base font-bold">🛡️ Tình trạng Đối tác</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats?.merchantsByStatus || {}).length > 0 ? (
              Object.entries(stats?.merchantsByStatus || {}).map(([status, count]: any) => (
                <div
                  key={status}
                  className="flex-1 min-w-[40%] bg-gray-100 p-2 rounded-lg border border-gray-200 flex flex-col items-center"
                >
                  <div className="text-gray-500 text-[10px] font-extrabold">{status}</div>
                  <div className={`text-[20px] font-extrabold ${status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'}`}>{count}</div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm italic">Chưa có dữ liệu trạng thái</div>
            )}
          </div>
        </div>
      </div>

      {/* 3. NÚT LÀM MỚI NHANH */}
      <div className="text-right">
        <button
          className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg border border-orange-500 text-orange-600 bg-white hover:bg-orange-500 hover:text-white transition-all duration-150 shadow-sm active:scale-95"
          onClick={loadDashboard}
        >
          Cập nhật dữ liệu lúc: {new Date().toLocaleTimeString()} 🔄
        </button>
      </div>
    </div>
  );
}
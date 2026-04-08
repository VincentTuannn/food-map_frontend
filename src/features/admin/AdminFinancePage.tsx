import { useState, useMemo } from 'react';
import { useAppStore } from '../../shared/store/appStore';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

interface ChartPoint {
  date: string;
  userService: number;
  userPremium: number;
  merchantFee: number;
  total: number;
}

export function AdminFinancePage() {
  const showToast = useAppStore((s) => s.showToast);
  
  // [1] STATE: Quản lý khoảng thời gian lọc dữ liệu
  const [timeRange, setTimeRange] = useState<'7D' | '30D'>('7D');

  // [2] CHART LOGIC: Khởi tạo khung biểu đồ trống dựa trên thời gian
  // Khi ghép API: Bạn sẽ cộng dồn các giao dịch thật vào các mốc ngày ở đây
  const chartData: ChartPoint[] = useMemo(() => {
    const groups: Record<string, ChartPoint> = {};
    const days = timeRange === '7D' ? 7 : 30;
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      groups[dateStr] = { date: dateStr, userService: 0, userPremium: 0, merchantFee: 0, total: 0 };
    }
    return Object.values(groups);
  }, [timeRange]);

  const renderTypeLabel = (type: string) => {
    switch (type) {
      case 'SERVICE_PURCHASE': return <span style={{ color: 'var(--warn)' }}>Dịch vụ lẻ</span>;
      case 'PREMIUM_UPGRADE': return <span style={{ color: 'var(--brand)' }}>Nâng cấp VIP</span>;
      case 'MERCHANT_FEE': return <span style={{ color: 'var(--ok)' }}>Phí Quán ăn</span>;
      default: return type;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s' }}>
      
      {/* HEADER & FILTER */}
      <div className="card cardPad" style={{ background: 'var(--panel)' }}>
        <div className="rowBetween">
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--text)' }}>Finance & Reports</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
              - Đối soát dòng tiền (Apple Pay/Google Pay/MoMo)
              <br />- Báo cáo tổng doanh thu & tăng trưởng
            </div>
          </div>
          <div className="row" style={{ background: 'var(--bg)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
            <button 
              className={`btn ${timeRange === '7D' ? 'btnPrimary' : 'btnGhost'}`} 
              onClick={() => setTimeRange('7D')} 
              style={{ border: 'none', padding: '6px 12px' }}
            >
              7 ngày
            </button>
            <button 
              className={`btn ${timeRange === '30D' ? 'btnPrimary' : 'btnGhost'}`} 
              onClick={() => setTimeRange('30D')} 
              style={{ border: 'none', padding: '6px 12px' }}
            >
              30 ngày
            </button>
          </div>
        </div>
      </div>

      {/* [3] BIỂU ĐỒ: Cấu hình sẵn các miền dữ liệu (Service, VIP, Merchant) */}
      <div className="card cardPad" style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'var(--muted)', fontSize: 11}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--muted)', fontSize: 11}} tickFormatter={(v) => `${v/1000}k`} />
            <Tooltip 
              contentStyle={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)' }} 
              itemStyle={{ fontWeight: 600 }}
            />
            <Area type="monotone" name="Quán ăn" dataKey="merchantFee" stackId="1" stroke="var(--ok)" fill="var(--ok)" fillOpacity={0.15} strokeWidth={2} />
            <Area type="monotone" name="Dịch vụ" dataKey="userService" stackId="1" stroke="var(--warn)" fill="var(--warn)" fillOpacity={0.15} strokeWidth={2} />
            <Area type="monotone" name="Nâng cấp VIP" dataKey="userPremium" stackId="1" stroke="var(--brand)" fill="var(--brand)" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* [4] BẢNG GIAO DỊCH: Hiển thị trạng thái trống mặc định */}
      <div className="card cardPad">
        <div className="rowBetween" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>Lịch sử giao dịch gần đây</div>
          <button className="btn btnGhost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => showToast({ title: 'Đang kết nối API...' })}>
            Làm mới 🔄
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
            <thead>
              <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 8px' }}>Thời gian</th>
                <th style={{ padding: '12px 8px' }}>ID Giao dịch</th>
                <th style={{ padding: '12px 8px' }}>Loại hình</th>
                <th style={{ padding: '12px 8px' }}>Phương thức</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {/* Hiển thị thông báo khi chưa có dữ liệu API */}
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                  Chưa có giao dịch nào được tải.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
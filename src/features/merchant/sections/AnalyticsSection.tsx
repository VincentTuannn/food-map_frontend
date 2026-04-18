import { useEffect, useState } from 'react';
import { getMerchantAnalytics, type MerchantAnalytics } from '../../../api/services/analytics';
import { getPoiById } from '../../../api/services/poi';

export function AnalyticsSection() {
  const [data, setData] = useState<MerchantAnalytics | null>(null);
  const [poiNames, setPoiNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    getMerchantAnalytics()
      .then(async (res) => {
        setData(res);
        setError(null);

        // Lấy tên POI cho từng id trong heatmap
        const ids = Array.from(new Set((res.heatmap ?? []).map((p) => p.poi_id)));
        const nameMap: Record<string, string> = {};

        await Promise.all(
          ids.map(async (id) => {
            try {
              const poi = await getPoiById(id);
              nameMap[id] = poi.data?.name || id.slice(0, 8) + '...';
            } catch {
              nameMap[id] = id.slice(0, 8) + '...';
            }
          })
        );

        setPoiNames(nameMap);
      })
      .catch(() => setError('Không thể tải dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  // Tính màu heatmap
  const getHeatColor = (count: number, max: number) => {
    if (max === 0) return '#F9F5ED';
    const v = count / max;
    if (v > 0.8) return '#D97706';
    if (v > 0.6) return '#F59E0B';
    if (v > 0.4) return '#FDE68A';
    if (v > 0.2) return '#FEF3C7';
    return '#F9F5ED';
  };

  if (loading) return <div className="p-8 text-center text-[#8B7355]">Đang tải dữ liệu…</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const heatmapPoints = data?.heatmap ?? [];
  const maxCount = heatmapPoints.reduce((max, pt) => Math.max(max, pt.count), 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white/5 border border-[#f3f3f3] shadow p-6 flex flex-col items-center gap-2">
          <div className="text-xs uppercase tracking-widest text-amber-600 font-bold">TỔNG SỐ POI</div>
          <div className="text-2xl font-extrabold text-[#B85C38]">{data?.total_poi ?? '—'}</div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-[#f3f3f3] shadow p-6 flex flex-col items-center gap-2">
          <div className="text-xs uppercase tracking-widest text-amber-600 font-bold">TỔNG LƯỢT XEM</div>
          <div className="text-2xl font-extrabold text-[#B85C38]">{data?.total_views ?? '—'}</div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-[#f3f3f3] shadow p-6 flex flex-col items-center gap-2">
          <div className="text-xs uppercase tracking-widest text-amber-600 font-bold">TỔNG LƯỢT CHUYỂN ĐỔI</div>
          <div className="text-2xl font-extrabold text-[#B85C38]">{data?.total_conversions ?? '—'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Heatmap */}
        <div className="rounded-2xl bg-white/5 border border-[#f3f3f3] shadow p-6 flex flex-col gap-3">
          <div className="text-xs uppercase tracking-widest text-amber-600 font-bold mb-1">HEATMAP</div>
          <div className="font-playfair text-lg font-semibold text-white mb-1">Vùng tập trung khách</div>
          <div className="text-sm text-[#bbb] mb-4">Mật độ người dùng xung quanh các POI trong 30 ngày qua</div>

          <div className="w-full overflow-x-auto flex flex-wrap gap-3 justify-start">
            {heatmapPoints.map((p) => (
              <div key={p.poi_id} className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm"
                  style={{ background: getHeatColor(p.count, maxCount) }}
                  title={`POI: ${poiNames[p.poi_id] || p.poi_id}\nLat: ${p.lat}, Lng: ${p.lng}\nLượt: ${p.count}`}
                >
                  {p.count}
                </div>
                <div className="text-[10px] text-[#8B7355] mt-1 w-16 text-center truncate">
                  {poiNames[p.poi_id] || p.poi_id}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-2 items-center text-[11px] text-[#8B7355] mt-4">
            <span>Thấp</span>
            {['#FEF3C7', '#FDE68A', '#F59E0B', '#D97706'].map((c) => (
              <div key={c} className="w-4 h-4 rounded" style={{ background: c }} />
            ))}
            <span>Cao</span>
          </div>
        </div>

        {/* Conversion Rates Table */}
        <div className="rounded-2xl bg-white/5 border border-[#f3f3f3] shadow p-6 flex flex-col gap-3">
          <div className="text-xs uppercase tracking-widest text-amber-600 font-bold mb-1">TỶ LỆ CHUYỂN ĐỔI</div>
          <div className="font-playfair text-lg font-semibold text-white mb-3">Theo từng POI</div>

          <div className="overflow-x-auto">
            <table className="min-w-[320px] w-full text-xs text-left">
              <thead>
                <tr className="text-[#8B7355] border-b border-[#E8D9C5]">
                  <th className="py-2 px-3">POI</th>
                  <th className="py-2 px-3">Lượt xem</th>
                  <th className="py-2 px-3">Chuyển đổi</th>
                  <th className="py-2 px-3 text-right">Tỷ lệ (%)</th>
                </tr>
              </thead>
              {/* <tbody>
                {heatmapPoints.map((p) => (
                  <tr key={p.poi_id} className="border-b border-[#E8D9C5] last:border-b-0">
                    <td className="py-3 px-3 font-medium">{poiNames[p.poi_id] || p.poi_id}</td>
                    <td className="py-3 px-3">{p.views}</td>
                    <td className="py-3 px-3">{p.conversions}</td>
                    <td className="py-3 px-3 text-right">
                      {p.views ? ((p.conversions / p.views) * 100).toFixed(1) : '0.0'}%
                    </td>
                  </tr>
                ))}
              </tbody> */}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
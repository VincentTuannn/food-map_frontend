import { useState, useEffect } from 'react';
import { adminApi } from '../../api/services/admin';
import { useAppStore } from '../../shared/store/appStore';

export function AdminTours() {
  const showToast = useAppStore((s) => s.showToast);
  
  // States dữ liệu
  const [tours, setTours] = useState<any[]>([]);
  const [availablePois, setAvailablePois] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // States Modal Tạo mới (Sử dụng isModalOpen)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTour, setNewTour] = useState({
    name: '',
    description: '',
    poi_ids: [] as string[]
  });

  // 1. Tải danh sách Tour và POIs khả dụng
  const loadData = async () => {
    setIsFetching(true);
    try {
      const [toursRes, poisRes] = await Promise.all([
        adminApi.getTours(),
        adminApi.getPois('ACTIVE') // Chỉ lấy các địa điểm đã duyệt để vào tour
      ]);
      setTours(Array.isArray(toursRes) ? toursRes : toursRes?.data || []);
      setAvailablePois(Array.isArray(poisRes) ? poisRes : poisRes?.data || []);
    } catch (error) {
      showToast({ title: '❌ Lỗi tải dữ liệu Tuyến đường' });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. Xử lý chọn/bỏ chọn POI cho Tour
  const togglePoiSelection = (id: string) => {
    setNewTour(prev => ({
      ...prev,
      poi_ids: prev.poi_ids.includes(id) 
        ? prev.poi_ids.filter(poiId => poiId !== id)
        : [...prev.poi_ids, id]
    }));
  };

  // 3. Xử lý Tạo Tour mới (POST /tours)
  const handleCreateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTour.poi_ids.length === 0) {
      showToast({ title: '⚠️ Vui lòng chọn ít nhất 1 địa điểm cho Tour' });
      return;
    }

    setIsProcessing(true);
    try {
      await adminApi.createTour(newTour);
      showToast({ title: '✅ Đã tạo Tuyến đường mới thành công!' });
      setIsModalOpen(false);
      setNewTour({ name: '', description: '', poi_ids: [] });
      loadData();
    } catch (error: any) {
      showToast({ title: `❌ Lỗi: ${error.message || 'Không thể tạo Tour'}` });
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Xử lý Xóa Tour
  const handleDeleteTour = async (id: string) => {
    if (!window.confirm('⚠️ Bạn có chắc chắn muốn xóa Tuyến đường này?')) return;
    try {
      await adminApi.deleteTour(id);
      setTours(prev => prev.filter(t => t.id !== id));
      showToast({ title: '🗑️ Đã xóa Tour thành công' });
    } catch (error) {
      showToast({ title: '❌ Lỗi khi xóa Tour' });
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      {/* HEADER SECTION */}
      <div className="card cardPad" style={{ marginBottom: 20 }}>
        <div className="rowBetween">
          <div>
            <h2 style={{ margin: 0, color: '#fff', fontSize: 24, fontWeight: 800 }}>🗺️ Tuyến đường du lịch</h2>
            <p style={{ color: '#888', marginTop: 5, fontSize: 14 }}>Tạo và quản lý các hành động tham quan kết hợp nhiều địa điểm.</p>
          </div>
          <button className="btn btnPrimary" onClick={() => setIsModalOpen(true)}>
            + Thiết kế Tour mới
          </button>
        </div>
      </div>

      {/* TOURS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
        {isFetching ? (
          <div className="card cardPad" style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>⏳ Đang tải danh sách tuyến đường...</div>
        ) : tours.length === 0 ? (
          <div className="card cardPad" style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>Chưa có tuyến đường nào được tạo.</div>
        ) : (
          tours.map((tour) => (
            <div key={tour.id} className="card cardPad" style={{ background: '#1E1E2D', border: '1px solid #333' }}>
              <div className="rowBetween" style={{ marginBottom: 15 }}>
                <h3 style={{ margin: 0, color: 'var(--brand)', fontSize: 18 }}>{tour.name}</h3>
                <button 
                  className="btn" 
                  style={{ color: '#ff4d4f', padding: '4px 8px', fontSize: 12 }}
                  onClick={() => handleDeleteTour(tour.id)}
                >
                  Xóa
                </button>
              </div>
              <p style={{ color: '#aaa', fontSize: 13, minHeight: 40 }}>{tour.description || 'Không có mô tả cho tour này.'}</p>
              
              <div style={{ marginTop: 15 }}>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 8, textTransform: 'uppercase', fontWeight: 700 }}>Các địa điểm trong tour:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {tour.Pois?.map((p: any) => (
                    <span key={p.id} style={{ background: '#2A2A3C', color: '#fff', padding: '4px 10px', borderRadius: 4, fontSize: 11, border: '1px solid #444' }}>
                      📍 {p.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL TẠO TOUR MỚI (isModalOpen) */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: 550, background: '#1E1E2D', borderRadius: 12, border: '1px solid #444', overflow: 'hidden' }}>
            <div className="rowBetween" style={{ padding: '20px 24px', borderBottom: '1px solid #333' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>Thiết kế Chuyến đi mới</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
            </div>
            
            <form onSubmit={handleCreateTour} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#aaa' }}>Tên Tuyến đường *</label>
                <input 
                  required className="input" placeholder="Ví dụ: Hành trình Ẩm thực Quận 4"
                  value={newTour.name} onChange={e => setNewTour({...newTour, name: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#aaa' }}>Mô tả ngắn gọn</label>
                <textarea 
                  className="input" style={{ minHeight: 80, resize: 'vertical' }} placeholder="Mô tả trải nghiệm cho khách..."
                  value={newTour.description} onChange={e => setNewTour({...newTour, description: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#aaa' }}>Chọn địa điểm vào Tour (Đã chọn: {newTour.poi_ids.length})</label>
                <div style={{ maxHeight: 200, overflowY: 'auto', background: '#151521', borderRadius: 8, padding: 10, border: '1px solid #333' }}>
                  {availablePois.map(poi => (
                    <label key={poi.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', cursor: 'pointer', borderBottom: '1px solid #222' }}>
                      <input 
                        type="checkbox" 
                        checked={newTour.poi_ids.includes(poi.id)}
                        onChange={() => togglePoiSelection(poi.id)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 13, color: newTour.poi_ids.includes(poi.id) ? 'var(--brand)' : '#fff' }}>{poi.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btnPrimary" style={{ flex: 2 }} disabled={isProcessing}>
                  {isProcessing ? 'Đang khởi tạo...' : 'Tạo Tuyến đường'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
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

  // === NEW: Edit Tour Modal state ===
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTour, setEditTour] = useState<any>(null);
  const [editPoiIds, setEditPoiIds] = useState<string[]>([]);

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

  // === NEW: Reorder functions for Create Tour ===
  const movePoiUp = (index: number) => {
    if (index === 0) return;
    setNewTour(prev => {
      const ids = [...prev.poi_ids];
      [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
      return { ...prev, poi_ids: ids };
    });
  };

  const movePoiDown = (index: number) => {
    setNewTour(prev => {
      if (index >= prev.poi_ids.length - 1) return prev;
      const ids = [...prev.poi_ids];
      [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
      return { ...prev, poi_ids: ids };
    });
  };

  // === NEW: Reorder functions for Edit Tour ===
  const moveEditPoiUp = (index: number) => {
    if (index === 0) return;
    const ids = [...editPoiIds];
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    setEditPoiIds(ids);
  };

  const moveEditPoiDown = (index: number) => {
    if (index >= editPoiIds.length - 1) return;
    const ids = [...editPoiIds];
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    setEditPoiIds(ids);
  };

  const toggleEditPoiSelection = (id: string) => {
    setEditPoiIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  // Helper: lấy tên POI từ ID
  const getPoiName = (id: string) => {
    const poi = availablePois.find((p: any) => p.id === id);
    return poi?.name || id.slice(0, 8) + '...';
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

  // === NEW: Handle Edit Tour ===
  const openEditModal = (tour: any) => {
    setEditTour({ id: tour.id, name: tour.name, description: tour.description || '' });
    // Extract existing POI IDs from tour, preserving order
    const existingPoiIds = (tour.Pois || []).map((p: any) => p.id);
    setEditPoiIds(existingPoiIds);
    setIsEditModalOpen(true);
  };

  const handleEditTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTour) return;
    if (editPoiIds.length === 0) {
      showToast({ title: '⚠️ Tour phải có ít nhất 1 địa điểm' });
      return;
    }

    setIsProcessing(true);
    try {
      await adminApi.updateTour(editTour.id, {
        name: editTour.name,
        description: editTour.description,
        poi_ids: editPoiIds,
      });
      showToast({ title: '✅ Đã cập nhật Tuyến đường!' });
      setIsEditModalOpen(false);
      setEditTour(null);
      setEditPoiIds([]);
      loadData();
    } catch (error: any) {
      showToast({ title: `❌ Lỗi: ${error.message || 'Không thể cập nhật'}` });
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

  // === Reorder list component (shared between Create & Edit) ===
  const ReorderList = ({ poiIds, onMoveUp, onMoveDown }: { poiIds: string[], onMoveUp: (i: number) => void, onMoveDown: (i: number) => void }) => {
    if (poiIds.length === 0) return <div style={{ color: '#555', fontSize: 12, padding: 10 }}>Chưa chọn địa điểm nào</div>;
    return (
      <div style={{ background: '#0d0d1a', borderRadius: 8, padding: 8, border: '1px solid #333', marginTop: 8 }}>
        <div style={{ fontSize: 11, color: '#666', marginBottom: 6, fontWeight: 700 }}>THỨ TỰ DỪNG CHÂN ({poiIds.length} điểm):</div>
        {poiIds.map((id, index) => (
          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderBottom: index < poiIds.length - 1 ? '1px solid #222' : 'none' }}>
            <span style={{ color: 'var(--brand)', fontWeight: 900, fontSize: 14, minWidth: 22 }}>{index + 1}</span>
            <span style={{ flex: 1, fontSize: 13, color: '#fff' }}>{getPoiName(id)}</span>
            <button
              type="button"
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              style={{ background: 'none', border: '1px solid #444', borderRadius: 4, color: index === 0 ? '#333' : '#aaa', cursor: index === 0 ? 'default' : 'pointer', padding: '2px 6px', fontSize: 12 }}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => onMoveDown(index)}
              disabled={index === poiIds.length - 1}
              style={{ background: 'none', border: '1px solid #444', borderRadius: 4, color: index === poiIds.length - 1 ? '#333' : '#aaa', cursor: index === poiIds.length - 1 ? 'default' : 'pointer', padding: '2px 6px', fontSize: 12 }}
            >
              ↓
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      {/* HEADER SECTION */}
      <div className="card cardPad" style={{ marginBottom: 20 }}>
        <div className="rowBetween">
          <div>
            <h2 style={{ margin: 0, color: '#8B7355', fontSize: 24, fontWeight: 800 }}>🗺️ Tuyến đường du lịch</h2>
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
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn btnGhost"
                    style={{ padding: '4px 8px', fontSize: 12 }}
                    onClick={() => openEditModal(tour)}
                  >
                    ✏️ Sửa
                  </button>
                  <button 
                    className="btn" 
                    style={{ color: '#ff4d4f', padding: '4px 8px', fontSize: 12 }}
                    onClick={() => handleDeleteTour(tour.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
              <p style={{ color: '#aaa', fontSize: 13, minHeight: 40 }}>{tour.description || 'Không có mô tả cho tour này.'}</p>
              
              <div style={{ marginTop: 15 }}>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 8, textTransform: 'uppercase', fontWeight: 700 }}>Các địa điểm trong tour:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {tour.Pois?.map((p: any, idx: number) => (
                    <span key={p.id} style={{ background: '#2A2A3C', color: '#fff', padding: '4px 10px', borderRadius: 4, fontSize: 11, border: '1px solid #444' }}>
                      <span style={{ color: 'var(--brand)', fontWeight: 700 }}>{idx + 1}.</span> 📍 {p.name}
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
          <div style={{ width: 600, background: '#1E1E2D', borderRadius: 12, border: '1px solid #444', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="rowBetween" style={{ padding: '20px 24px', borderBottom: '1px solid #333' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>Thiết kế Chuyến đi mới</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
            </div>
            
            <form onSubmit={handleCreateTour} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>
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
                <div style={{ maxHeight: 180, overflowY: 'auto', background: '#151521', borderRadius: 8, padding: 10, border: '1px solid #333' }}>
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

              {/* === NEW: Reorder selected POIs === */}
              <ReorderList poiIds={newTour.poi_ids} onMoveUp={movePoiUp} onMoveDown={movePoiDown} />

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

      {/* === NEW: MODAL CHỈNH SỬA TOUR === */}
      {isEditModalOpen && editTour && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: 600, background: '#1E1E2D', borderRadius: 12, border: '1px solid #444', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="rowBetween" style={{ padding: '20px 24px', borderBottom: '1px solid #333' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>✏️ Chỉnh sửa Tour</h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            <form onSubmit={handleEditTour} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8, fontSize: 12, color: '#888' }}>
                Đang chỉnh sửa: <b style={{ color: '#fff' }}>{editTour.name}</b>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#aaa' }}>Tên Tuyến đường *</label>
                <input
                  required className="input"
                  value={editTour.name} onChange={e => setEditTour({ ...editTour, name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#aaa' }}>Mô tả</label>
                <textarea
                  className="input" style={{ minHeight: 80, resize: 'vertical' }}
                  value={editTour.description} onChange={e => setEditTour({ ...editTour, description: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#aaa' }}>Chọn địa điểm (Đã chọn: {editPoiIds.length})</label>
                <div style={{ maxHeight: 180, overflowY: 'auto', background: '#151521', borderRadius: 8, padding: 10, border: '1px solid #333' }}>
                  {availablePois.map(poi => (
                    <label key={poi.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', cursor: 'pointer', borderBottom: '1px solid #222' }}>
                      <input
                        type="checkbox"
                        checked={editPoiIds.includes(poi.id)}
                        onChange={() => toggleEditPoiSelection(poi.id)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 13, color: editPoiIds.includes(poi.id) ? 'var(--brand)' : '#fff' }}>{poi.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reorder selected POIs for Edit */}
              <ReorderList poiIds={editPoiIds} onMoveUp={moveEditPoiUp} onMoveDown={moveEditPoiDown} />

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setIsEditModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btnPrimary" style={{ flex: 2 }} disabled={isProcessing}>
                  {isProcessing ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
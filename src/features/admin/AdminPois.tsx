import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { adminApi } from '../../api/services/admin';
import { useAppStore } from '../../shared/store/appStore';

// Fix Leaflet icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// Component bắt sự kiện click trên map để lấy tọa độ tạo POI mới
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// 1. Hàm giải mã đa năng
const parseLocation = (location: any) => {
  if (!location) return { lat: 'N/A', lng: 'N/A' };
  try {
    if (location.coordinates && Array.isArray(location.coordinates)) {
      return {
        lng: location.coordinates[0].toFixed(6),
        lat: location.coordinates[1].toFixed(6)
      };
    }
    if (typeof location === 'string') {
      const bytes = location.match(/[\da-f]{2}/gi)!.map(h => parseInt(h, 16));
      const view = new DataView(new Uint8Array(bytes).buffer);
      const hasSRID = view.getUint8(4) === 0x20;
      const offset = hasSRID ? 9 : 1; 
      const lng = view.getFloat64(offset, true); 
      const lat = view.getFloat64(offset + 8, true);
      return { lat: lat.toFixed(6), lng: lng.toFixed(6) };
    }
    // Handle lat/lng fields from our new non-PostGIS schema
    if (location.lat != null && location.lng != null) {
      return { lat: Number(location.lat).toFixed(6), lng: Number(location.lng).toFixed(6) };
    }
    return { lat: 'N/A', lng: 'N/A' };
  } catch (e) {
    return { lat: 'N/A', lng: 'N/A' };
  }
};

export function AdminPois() {
  const showToast = useAppStore((s) => s.showToast);
  
  const [pois, setPois] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<any>(null);

  // === NEW: Create POI Modal state ===
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPoi, setNewPoi] = useState({ name: '', lat: '', lng: '' });
  const [isCreating, setIsCreating] = useState(false);

  // === NEW: Edit POI Modal state ===
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPoi, setEditPoi] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [filterStatus, setFilterStatus] = useState('');
  const [searchName, setSearchName] = useState('');

  const [viewState, setViewState] = useState({
    longitude: 106.660172,
    latitude: 10.762622,
    zoom: 12
  });

  const loadPois = async () => {
    setIsFetching(true);
    try {
      const res = await adminApi.getPois(filterStatus, searchName);
      const data = Array.isArray(res) ? res : res?.data || [];
      
      const processedData = data.map((p: any) => {
        // Fallback to p directly if p.location is missing, as we might be using lat/lng fields now
        const coords = parseLocation(p.location || p);
        return { ...p, decodedLat: coords.lat, decodedLng: coords.lng };
      });

      setPois(processedData);

      const firstValid = processedData.find((p: any) => p.decodedLat !== 'N/A' && p.status !== 'INACTIVE');
      if (firstValid) {
        setViewState(prev => ({
          ...prev,
          longitude: Number(firstValid.decodedLng),
          latitude: Number(firstValid.decodedLat),
          zoom: 13
        }));
      }
    } catch (error) {
      showToast({ title: '❌ Lỗi tải danh sách địa điểm' });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { loadPois(); }, [filterStatus]);

  const handleFlyToPoi = (poi: any) => {
    setSelectedPoi(poi);
    if (poi.decodedLat && poi.decodedLat !== 'N/A') {
      setViewState({
        ...viewState,
        longitude: Number(poi.decodedLng), 
        latitude: Number(poi.decodedLat),
        zoom: 16
      });
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
  };

  // FIX LỖI Ở ĐÂY: CẬP NHẬT GIAO DIỆN NGAY LẬP TỨC MÀ KHÔNG CHỜ BACKEND
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await adminApi.updatePoiStatus(id, newStatus as any);
      showToast({ title: `✅ Đã chuyển trạng thái sang ${newStatus}` });
      
      // Đóng modal và bỏ chọn điểm ghim
      setIsModalOpen(false); 
      setSelectedPoi(null);
      
      // Tự động thay đổi dữ liệu trong danh sách hiện tại
      setPois(prev => {
        // Nếu đang ở tab "Tất cả trạng thái", thì giữ nguyên vị trí dòng đó nhưng đổi màu và chữ
        if (filterStatus === '') {
          return prev.map(p => p.id === id ? { ...p, status: newStatus } : p);
        }
        // Nếu đang ở tab PENDING mà duyệt xong -> Xóa luôn dòng đó khỏi danh sách PENDING
        return prev.filter(p => p.id !== id);
      });

    } catch (error) {
      showToast({ title: '❌ Cập nhật thất bại' });
    }
  };

  const handleDeletePoi = async (id: string) => {
    if (!window.confirm('⚠️ Xóa vĩnh viễn địa điểm này?')) return;
    try {
      await adminApi.deletePoi(id);
      setPois(prev => prev.filter(p => p.id !== id));
      showToast({ title: '🗑️ Đã xóa địa điểm' });
    } catch (error) {
      showToast({ title: '❌ Lỗi khi xóa' });
    }
  };

  // === NEW: Handle map click → fill Create POI form ===
  const handleMapClick = (lat: number, lng: number) => {
    setNewPoi({ name: '', lat: lat.toFixed(6), lng: lng.toFixed(6) });
    setIsCreateModalOpen(true);
  };

  // === NEW: Handle Create POI submit ===
  const handleCreatePoi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoi.name.trim()) {
      showToast({ title: '⚠️ Vui lòng nhập tên địa điểm' });
      return;
    }
    setIsCreating(true);
    try {
      await adminApi.createPoi({
        name: newPoi.name,
        lat: parseFloat(newPoi.lat),
        lng: parseFloat(newPoi.lng),
      });
      showToast({ title: '✅ Đã tạo địa điểm mới!' });
      setIsCreateModalOpen(false);
      setNewPoi({ name: '', lat: '', lng: '' });
      loadPois();
    } catch (error: any) {
      showToast({ title: `❌ Lỗi: ${error.message || 'Không thể tạo POI'}` });
    } finally {
      setIsCreating(false);
    }
  };

  // === NEW: Handle Edit POI submit ===
  const handleEditPoi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPoi) return;
    setIsEditing(true);
    try {
      await adminApi.updatePoi(editPoi.id, {
        name: editPoi.name,
        lat: parseFloat(editPoi.decodedLat),
        lng: parseFloat(editPoi.decodedLng),
      });
      showToast({ title: '✅ Đã cập nhật địa điểm!' });
      setIsEditModalOpen(false);
      setEditPoi(null);
      loadPois();
    } catch (error: any) {
      showToast({ title: `❌ Lỗi: ${error.message || 'Không thể cập nhật'}` });
    } finally {
      setIsEditing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#00C853';
      case 'PENDING': return '#FFCC00';
      case 'REJECTED': return '#FF3B30';
      default: return '#888';
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s', display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* ===== PHẦN 1: BẢN ĐỒ LEAFLET ===== */}
      <div className="card" style={{ height: '400px', overflow: 'hidden', border: '1px solid #333', position: 'relative' }}>
          {/* Hướng dẫn click map */}
          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '6px 12px', borderRadius: 8, fontSize: 11, pointerEvents: 'none' }}>
            💡 Click trên bản đồ để tạo POI mới
          </div>
          <MapContainer
            center={[viewState.latitude, viewState.longitude]}
            zoom={viewState.zoom}
            style={{ width: '100%', height: '100%' }}
          >
            <ChangeView center={[viewState.latitude, viewState.longitude]} zoom={viewState.zoom} />
            <MapClickHandler onMapClick={handleMapClick} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            
            {pois.map(poi => {
              if (poi.status === 'INACTIVE' || poi.decodedLat === 'N/A') return null;

              return (
                <Marker 
                  key={poi.id} 
                  position={[Number(poi.decodedLat), Number(poi.decodedLng)]}
                  eventHandlers={{
                    click: () => handleFlyToPoi(poi)
                  }}
                >
                  <Popup>
                    <div style={{ color: '#000', padding: '5px', fontWeight: 700 }}>{poi.name}</div>
                    <div style={{ color: '#666', fontSize: '12px' }}>Trạng thái: {poi.status}</div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
      </div>

      {/* ===== PHẦN 2: BỘ LỌC ===== */}
      <div className="card cardPad">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: '#8B7355', fontSize: 24, fontWeight: 800 }}>📍 Duyệt địa điểm (POIs)</h2>
          <button className="btn btnPrimary" onClick={() => { setNewPoi({ name: '', lat: '10.762622', lng: '106.660172' }); setIsCreateModalOpen(true); }}>
            + Thêm địa điểm
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input 
            className="input" placeholder="Tìm tên địa điểm..." 
            style={{ flex: 1 }}
            value={searchName} onChange={e => setSearchName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadPois()}
          />
          <select className="select" style={{ width: 180 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">🕒 Chờ duyệt</option>
            <option value="ACTIVE">✅ Đã duyệt</option>
            <option value="REJECTED">❌ Từ chối</option>
            <option value="INACTIVE">Ẩn (Không lên Map)</option>
          </select>
          <button className="btn btnPrimary" onClick={loadPois} style={{ padding: '0 25px' }}>🔍 Tìm</button>
        </div>
      </div>

      {/* ===== PHẦN 3: BẢNG DANH SÁCH ===== */}
      <div className="card cardPad">
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#8B7355', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: '#666', borderBottom: '1px solid #333' }}>
              <th style={{ padding: 15 }}>Địa điểm / Tọa độ</th>
              <th style={{ padding: 15 }}>Chủ sở hữu</th>
              <th style={{ padding: 15 }}>Trạng thái</th>
              <th style={{ padding: 15, textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (<tr><td colSpan={4} style={{ textAlign: 'center', padding: 40 }}>⏳ Đang tải...</td></tr>) : 
             pois.length === 0 ? (<tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#888' }}>Không có dữ liệu.</td></tr>) :
             pois.map(poi => (
              <tr 
                key={poi.id} 
                style={{ 
                  borderBottom: '1px solid #222',
                  background: selectedPoi?.id === poi.id ? 'rgba(123, 44, 191, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onClick={() => handleFlyToPoi(poi)}
              >
                <td style={{ padding: 15 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{poi.name}</div>
                  <div style={{ fontSize: 12, color: '#9D4EDD', marginTop: 4 }}>
                    🎯 {poi.decodedLat}, {poi.decodedLng}
                  </div>
                </td>
                <td style={{ padding: 15, color: '#aaa' }}>{poi.Merchant?.business_name || 'N/A'}</td>
                <td style={{ padding: 15 }}>
                  <span className="pill" style={{ background: getStatusColor(poi.status), color: '#fff', fontSize: 10 }}>{poi.status}</span>
                </td>
                <td style={{ padding: 15, textAlign: 'right' }}>
                  <button 
                    className="btn btnGhost" 
                    style={{ padding: '6px 12px', fontSize: 12, marginRight: 4 }} 
                    onClick={(e) => { e.stopPropagation(); setEditPoi({ ...poi }); setIsEditModalOpen(true); }}
                  >
                    ✏️ Sửa
                  </button>
                  <button 
                    className="btn btnGhost" 
                    style={{ padding: '6px 12px', fontSize: 12, marginRight: 4 }} 
                    onClick={(e) => { e.stopPropagation(); setSelectedPoi(poi); setIsModalOpen(true); }}
                  >
                    👁️ Duyệt
                  </button>
                  <button className="btn" style={{ color: '#ff4d4f' }} onClick={(e) => { e.stopPropagation(); handleDeletePoi(poi.id); }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== PHẦN 4: MODAL CHI TIẾT (DUYỆT) ===== */}
      {isModalOpen && selectedPoi && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: 650, background: '#1E1E2D', borderRadius: 12, border: '1px solid #444', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="rowBetween" style={{ padding: '20px 24px', borderBottom: '1px solid #333' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>Chi tiết địa điểm: {selectedPoi.name}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20 }}>✕</button>
            </div>
            
            <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={{ color: '#888', fontSize: 12 }}>Tọa độ thực tế</label>
                  <div style={{ color: '#FFCC00', fontWeight: 700, fontSize: 15 }}>
                    {selectedPoi.decodedLat}, {selectedPoi.decodedLng}
                  </div>
                </div>
                <div>
                  <label style={{ color: '#888', fontSize: 12 }}>Cơ sở sở hữu</label>
                  <div style={{ color: 'var(--brand)' }}>{selectedPoi.Merchant?.business_name || 'Hệ thống'}</div>
                </div>
              </div>

              <div style={{ padding: 15, background: '#151521', borderRadius: 8, marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#C77DFF' }}>Nội dung đa ngôn ngữ</h4>
                {selectedPoi.PoiContents?.length > 0 ? selectedPoi.PoiContents.map((content: any) => (
                  <div key={content.id} style={{ marginBottom: 10, fontSize: 13, borderBottom: '1px solid #2A2A3C', paddingBottom: 5 }}>
                    <b style={{ color: '#fff' }}>[{content.language_code}]</b>: {content.description.substring(0, 100)}...
                  </div>
                )) : <div style={{ color: '#888' }}>Không có dữ liệu nội dung.</div>}
              </div>

              <h4 style={{ margin: '0 0 10px 0', color: '#FFCC00' }}>⭐ Đánh giá mới nhất</h4>
              {selectedPoi.Reviews?.length > 0 ? selectedPoi.Reviews.map((r: any) => (
                <div key={r.id} style={{ fontSize: 12, color: '#aaa', padding: '8px 0', borderBottom: '1px dotted #333' }}>
                  <b style={{ color: '#fff' }}>{r.rating} sao:</b> {r.comment}
                </div>
              )) : <div style={{ color: '#555', fontSize: 12 }}>Chưa có đánh giá nào.</div>}
            </div>

            <div style={{ padding: 24, background: '#161622', borderTop: '1px solid #333', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
               <button className="btn" style={{ background: '#FF3B30', color: '#fff' }} onClick={() => handleUpdateStatus(selectedPoi.id, 'REJECTED')}>❌ Từ chối</button>
               <button className="btn" style={{ background: '#888', color: '#fff' }} onClick={() => handleUpdateStatus(selectedPoi.id, 'INACTIVE')}>Ẩn</button>
               <button className="btn btnPrimary" onClick={() => handleUpdateStatus(selectedPoi.id, 'ACTIVE')}>✅ Duyệt hoạt động</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== PHẦN 5: MODAL TẠO POI MỚI ===== */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: 450, background: '#1E1E2D', borderRadius: 12, border: '1px solid #444', overflow: 'hidden' }}>
            <div className="rowBetween" style={{ padding: '20px 24px', borderBottom: '1px solid #333' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>📍 Thêm địa điểm mới</h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            <form onSubmit={handleCreatePoi} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'rgba(123,44,191,0.1)', padding: 10, borderRadius: 8, fontSize: 12, color: '#C77DFF' }}>
                💡 Click trên bản đồ để tự động lấy tọa độ, hoặc nhập thủ công bên dưới.
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#aaa' }}>Tên địa điểm *</label>
                <input
                  required className="input" placeholder="Ví dụ: Phở Thìn Bờ Hồ"
                  value={newPoi.name} onChange={e => setNewPoi({ ...newPoi, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#aaa' }}>Latitude *</label>
                  <input
                    required className="input" type="number" step="any" placeholder="10.762622"
                    value={newPoi.lat} onChange={e => setNewPoi({ ...newPoi, lat: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#aaa' }}>Longitude *</label>
                  <input
                    required className="input" type="number" step="any" placeholder="106.660172"
                    value={newPoi.lng} onChange={e => setNewPoi({ ...newPoi, lng: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setIsCreateModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btnPrimary" style={{ flex: 2 }} disabled={isCreating}>
                  {isCreating ? 'Đang tạo...' : '📍 Tạo địa điểm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== PHẦN 6: MODAL CHỈNH SỬA POI ===== */}
      {isEditModalOpen && editPoi && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: 450, background: '#1E1E2D', borderRadius: 12, border: '1px solid #444', overflow: 'hidden' }}>
            <div className="rowBetween" style={{ padding: '20px 24px', borderBottom: '1px solid #333' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>✏️ Chỉnh sửa địa điểm</h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            <form onSubmit={handleEditPoi} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8, fontSize: 12, color: '#888' }}>
                Đang chỉnh sửa: <b style={{ color: '#fff' }}>{editPoi.name}</b>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#aaa' }}>Tên địa điểm</label>
                <input
                  required className="input"
                  value={editPoi.name} onChange={e => setEditPoi({ ...editPoi, name: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#aaa' }}>Latitude</label>
                  <input
                    required className="input" type="number" step="any"
                    value={editPoi.decodedLat} onChange={e => setEditPoi({ ...editPoi, decodedLat: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#aaa' }}>Longitude</label>
                  <input
                    required className="input" type="number" step="any"
                    value={editPoi.decodedLng} onChange={e => setEditPoi({ ...editPoi, decodedLng: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setIsEditModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btnPrimary" style={{ flex: 2 }} disabled={isEditing}>
                  {isEditing ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
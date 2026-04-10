import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { adminApi } from '../../api/services/admin';
import { useAppStore } from '../../shared/store/appStore';

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
    return { lat: 'N/A', lng: 'N/A' };
  } catch (e) {
    return { lat: 'N/A', lng: 'N/A' };
  }
};

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN; 

export function AdminPois() {
  const showToast = useAppStore((s) => s.showToast);
  
  const [pois, setPois] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<any>(null);

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
        const coords = parseLocation(p.location);
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
      
      {/* ===== PHẦN 1: BẢN ĐỒ MAPBOX ===== */}
      <div className="card" style={{ height: '400px', overflow: 'hidden', border: '1px solid #333', position: 'relative' }}>
        {!MAPBOX_TOKEN ? (
          <div style={{ padding: 20, color: '#ff4d4f', textAlign: 'center', marginTop: 100 }}>
             ⚠️ Không tìm thấy Mapbox Token.
          </div>
        ) : (
          <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/ntnhan3110/cmmz0ajok004s01r0awao4egc"
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: '100%', height: '100%' }}
          >
            <NavigationControl position="top-right" />
            
            {pois.map(poi => {
              // NẾU ẨN HOẶC KHÔNG CÓ TỌA ĐỘ -> KHÔNG VẼ LÊN BẢN ĐỒ
              if (poi.status === 'INACTIVE' || poi.decodedLat === 'N/A') return null;

              // Chọn màu Pin
              let pinColor = '#FF3B30'; // Đỏ (REJECTED)
              if (poi.status === 'ACTIVE') pinColor = '#00C853'; // Xanh lá
              if (poi.status === 'PENDING') pinColor = '#FFCC00'; // Vàng

              return (
                <Marker 
                  key={poi.id} 
                  longitude={Number(poi.decodedLng)} 
                  latitude={Number(poi.decodedLat)} 
                  anchor="bottom"
                  onClick={e => {
                    e.originalEvent.stopPropagation();
                    handleFlyToPoi(poi);
                  }}
                >
                  <svg 
                    width="36" height="36" viewBox="0 0 24 24" 
                    style={{ 
                      cursor: 'pointer',
                      filter: selectedPoi?.id === poi.id ? `drop-shadow(0 0 12px ${pinColor})` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                      transform: selectedPoi?.id === poi.id ? 'scale(1.2)' : 'scale(1)',
                      transition: 'all 0.3s'
                    }}
                  >
                    <path 
                      fill={pinColor} 
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    />
                  </svg>
                </Marker>
              );
            })}

            {selectedPoi && selectedPoi.decodedLat !== 'N/A' && selectedPoi.status !== 'INACTIVE' && (
              <Popup
                longitude={Number(selectedPoi.decodedLng)}
                latitude={Number(selectedPoi.decodedLat)}
                anchor="top"
                onClose={() => setSelectedPoi(null)}
                closeButton={false}
              >
                <div style={{ color: '#000', padding: '5px', fontWeight: 700 }}>{selectedPoi.name}</div>
              </Popup>
            )}
          </Map>
        )}
      </div>

      {/* ===== PHẦN 2: BỘ LỌC ===== */}
      <div className="card cardPad">
        <h2 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: 24, fontWeight: 800 }}>📍 Duyệt địa điểm (POIs)</h2>
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
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', textAlign: 'left' }}>
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
                    style={{ padding: '6px 12px', fontSize: 12, marginRight: 8 }} 
                    onClick={(e) => { e.stopPropagation(); setSelectedPoi(poi); setIsModalOpen(true); }}
                  >
                    👁️ Xem & Duyệt
                  </button>
                  <button className="btn" style={{ color: '#ff4d4f' }} onClick={(e) => { e.stopPropagation(); handleDeletePoi(poi.id); }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== PHẦN 4: MODAL CHI TIẾT ===== */}
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
    </div>
  );
}
import { useState, useRef } from 'react';
import { useAppStore } from '../../shared/store/appStore';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Lấy Token Mapbox từ file .env
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export function AdminModerationPage() {
  const showToast = useAppStore((s) => s.showToast);
  
  // [1] STATE: Quản lý danh sách POI chờ duyệt và POI đang chọn
  const [pendingPois] = useState<any[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<any>(null);
  
  const mapRef = useRef<any>(null);

  // [2] HANDLER: Vị trí sẽ đặt logic gọi API đồng bộ dữ liệu sau này
  const fetchPending = () => {
    showToast({ title: 'Đang làm mới danh sách chờ duyệt...' });
  };

  // [3] HANDLER: Vị trí đặt logic duyệt địa điểm (PUT status: ACTIVE)
  const handleApprove = (id: string) => {
    showToast({ title: `✅ Đã phê duyệt địa điểm ID: ${id}` });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s' }}>
      
      {/* ======================= PHẦN 1: DUYỆT POI TRÊN BẢN ĐỒ ======================= */}
      <div className="card cardPad">
        <div className="rowBetween" style={{ marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20, color: 'var(--text)' }}>Duyệt POI mới</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
              Kiểm tra vị trí trên bản đồ trước khi phê duyệt yêu cầu từ Merchant.
            </div>
          </div>
          <button className="btn btnPrimary" onClick={fetchPending}>
            🔄 Làm mới dữ liệu
          </button>
        </div>

        {/* BẢN ĐỒ: Hiển thị mặc định khu vực trung tâm */}
        <div style={{ 
          height: 400, 
          width: '100%', 
          borderRadius: 16, 
          overflow: 'hidden', 
          border: '1px solid var(--border)',
          marginBottom: 20,
          background: 'var(--bg)'
        }}>
          <Map
            ref={mapRef}
            mapboxAccessToken={MAPBOX_TOKEN}
            initialViewState={{ longitude: 106.660172, latitude: 10.762622, zoom: 12 }}
            mapStyle="mapbox://styles/ntnhan3110/cmmz0ajok004s01r0awao4egc"
            style={{ width: '100%', height: '100%' }}
          >
            {/* [4] RENDER MARKERS: Sau này sẽ dùng pendingPois.map(...) */}
          </Map>
        </div>

        {/* DANH SÁCH CUỘN: Hiển thị khi có dữ liệu chờ duyệt */}
        <div style={{ maxHeight: 350, overflowY: 'auto', paddingRight: 8 }}>
          {pendingPois.length === 0 ? (
            <div style={{ color: 'var(--ok)', textAlign: 'center', padding: '40px 0', fontSize: 15, fontWeight: 600 }}>
              🎉 Toàn bộ địa điểm đã được xử lý. Không còn yêu cầu nào!
            </div>
          ) : (
            pendingPois.map((poi) => (
              <div 
                key={poi.id} 
                className="rowBetween"
                style={{
                  background: 'var(--panel)',
                  padding: 16,
                  marginBottom: 12,
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>{poi.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                    ID: {poi.id}
                  </div>
                </div>
                <button 
                  className="btn" 
                  style={{ color: 'var(--ok)', borderColor: 'var(--ok)', fontWeight: 700 }}
                  onClick={() => handleApprove(poi.id)}
                >
                  Phê duyệt
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ======================= PHẦN 2: KIỂM DUYỆT AUDIO/TEXT ======================= */}
      <div className="card cardPad">
        <div style={{ fontWeight: 900, marginBottom: 8, fontSize: 20, color: 'var(--text)' }}>Kiểm duyệt nội dung Audio/Text</div>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
          Hệ thống rà soát các tệp tin Audio hoặc bài viết mô tả quán ăn do Merchant tải lên.
        </div>
        
        <button className="btn" onClick={() => showToast({ title: 'Đang kết nối hệ thống kiểm duyệt...' })}>
          Mở hàng đợi Moderation
        </button>

        {/* TRẠNG THÁI TRỐNG: Dùng làm placeholder cho UI */}
        <div style={{ 
          marginTop: 24, 
          height: 200, 
          border: '2px dashed var(--border)', 
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--muted)',
          fontSize: 14,
          background: 'var(--panel)'
        }}>
          Hàng đợi nội dung đang trống
        </div>
      </div>

    </div>
  );
}
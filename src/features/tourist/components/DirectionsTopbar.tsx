import type { Dispatch, SetStateAction } from "react";
type DirectionsTopbarProps = {
  show: boolean;
  isTopbarCollapsed: boolean;
  setIsTopbarCollapsed: Dispatch<SetStateAction<boolean>>;
  position: { lat: number; lng: number } | null;
  routeTargetLabel: string | null;
};

export function DirectionsTopbar({
  show,
  isTopbarCollapsed,
  setIsTopbarCollapsed,
  position,
  routeTargetLabel,
}: DirectionsTopbarProps) {
  if (!show) return null;

  return (
    <>
      {isTopbarCollapsed ? (
        <button
          className="dir-topbar-mini"
          onClick={() => setIsTopbarCollapsed(false)}
          aria-label="Mở thông tin chỉ đường"
        >
          🗺️
        </button>
      ) : (
        <div className="dir-topbar">
          <button
            className="dir-topbar-toggle"
            onClick={() => setIsTopbarCollapsed(true)}
            aria-label="Thu nhỏ topbar"
          >
            —
          </button>
          <div className="dir-location-row">
            <div className="dir-location-icon">📍</div>
            <div className="dir-location-content">
              <div className="dir-location-label">Vị trí của bạn</div>
              <div className="dir-location-address">
                {position ? "Vị trí hiện tại" : "Đang lấy vị trí..."}
              </div>
            </div>
          </div>
          <div className="dir-divider" />
          <div className="dir-location-row">
            <div className="dir-location-icon">🏁</div>
            <div className="dir-location-content">
              <div className="dir-location-label">Điểm đến</div>
              <div className="dir-location-address">{routeTargetLabel ?? "Chưa chọn"}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

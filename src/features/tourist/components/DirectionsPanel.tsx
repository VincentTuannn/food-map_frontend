import type { Dispatch, SetStateAction } from "react";
import type { DirectionsProfile, DirectionsRoute } from "../../../api/services/directions";
import type { TourPoi } from "../../../api/services/tours";
import type { UserTourPoi } from "../../../api/services/userTours";
import { AddStopPanel } from "./AddStopPanel";
import { DirectionsSteps } from "./DirectionsSteps";

type AddStopCandidate = {
  id: string;
  name?: string;
  lat?: number;
  lng?: number;
};

type StartMultiRouteItem = {
  id: string;
  poiId?: string;
  name?: string;
  lat?: number;
  lng?: number;
};

type DirectionsPanelProps = {
  show: boolean;
  isMobile: boolean;
  route?: DirectionsRoute;
  isRouting: boolean;
  dirTab: "overview" | "steps";
  setDirTab: (tab: "overview" | "steps") => void;
  sheetExpanded: boolean;
  setSheetExpanded: Dispatch<SetStateAction<boolean>>;
  profile: DirectionsProfile;
  setProfile: (profile: DirectionsProfile) => void;
  tourMeta: { id: string; scope: "mine" | "saved"; name?: string } | null;
  tourPois: Array<TourPoi & UserTourPoi & { poiId?: string }>;
  filteredTourPois: Array<TourPoi & UserTourPoi & { poiId?: string }>;
  addStopCandidates: AddStopCandidate[];
  tourQuery: string;
  setTourQuery: (value: string) => void;
  showAddStop: boolean;
  setShowAddStop: Dispatch<SetStateAction<boolean>>;
  selectedStopIds: Set<string>;
  setSelectedStopIds: Dispatch<SetStateAction<Set<string>>>;
  selectedStops: AddStopCandidate[];
  isMultiRouting: boolean;
  startMultiRoute: (list: StartMultiRouteItem[], label: string) => void;
  showAllSteps: boolean;
  setShowAllSteps: Dispatch<SetStateAction<boolean>>;
  hideBottomNav: boolean;
  toggleBottomNav: () => void;
  setShowDirections: Dispatch<SetStateAction<boolean>>;
  showToast: (args: { title: string; message?: string }) => void;
};

export function DirectionsPanel({
  show,
  isMobile,
  route,
  isRouting,
  dirTab,
  setDirTab,
  sheetExpanded,
  setSheetExpanded,
  profile,
  setProfile,
  tourMeta,
  tourPois,
  filteredTourPois,
  addStopCandidates,
  tourQuery,
  setTourQuery,
  showAddStop,
  setShowAddStop,
  selectedStopIds,
  setSelectedStopIds,
  selectedStops,
  isMultiRouting,
  startMultiRoute,
  showAllSteps,
  setShowAllSteps,
  hideBottomNav,
  toggleBottomNav,
  setShowDirections,
  showToast,
}: DirectionsPanelProps) {
  if (!show || (!route && !isRouting)) return null;

  const subtitle =
    tourPois.length > 0 ? "Từ danh sách tour hiện tại." : "Từ các địa điểm gần bạn.";

  const handleToggleStop = (id: string, checked: boolean) => {
    const next = new Set(selectedStopIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelectedStopIds(next);
  };

  const handleSelectAllStops = () => {
    setSelectedStopIds(new Set(addStopCandidates.map((poi) => poi.id)));
  };

  const handleClearStops = () => setSelectedStopIds(new Set());

  const handleStartMulti = () =>
    startMultiRoute(
      selectedStops.map((poi) => ({
        id: poi.id,
        poiId: poi.id,
        name: poi.name,
        lat: poi.lat,
        lng: poi.lng,
      })),
      "Nhiều điểm đã chọn"
    );

  return (
    <>
      {!isMobile && (
        <div className="dir-sidebar">
          <div className="dir-sidebar-content">
            <div className="dir-sidebar-head">
              <div>
                <div className="dir-sidebar-title">{tourMeta?.name ?? "Hành trình"}</div>
                <div className="dir-sidebar-stats">
                  {addStopCandidates.length > 0
                    ? `${addStopCandidates.length} điểm đến • ${route ? Math.round(route.distanceMeters / 100) / 10 : "..."} km`
                    : "Lộ trình hiện tại"}
                </div>
              </div>
              <div className="dir-sidebar-actions">
                <button
                  className="dir-hide-btn"
                  onClick={() => setShowDirections(false)}
                  aria-label="Ẩn chỉ đường"
                >
                  Ẩn
                </button>
                <button onClick={toggleBottomNav} aria-label="Ẩn hiện thanh menu dưới">
                  {hideBottomNav ? "Hiện menu" : "Ẩn menu"}
                </button>
              </div>
            </div>
            <div className="dir-route-info">
              <div className="dir-route-stats">
                <div className="dir-stat">
                  <div className="dir-stat-value">
                    {route ? `${Math.round(route.distanceMeters / 100) / 10} km` : "..."}
                  </div>
                  <div className="dir-stat-label">Tổng quãng đường</div>
                </div>
                <div className="dir-stat">
                  <div className="dir-stat-value">
                    {route ? `${Math.round(route.durationSeconds / 60)} phút` : "..."}
                  </div>
                  <div className="dir-stat-label">Thời gian ước tính</div>
                </div>
              </div>
              <button
                className="dir-start-btn"
                onClick={() => {
                  showToast({
                    title: "Bắt đầu dẫn đường",
                    message: "Hệ thống đang theo dõi vị trí của bạn",
                  });
                }}
              >
                🚗 Bắt đầu hành trình
              </button>
            </div>

            {addStopCandidates.length > 0 && (
              <div className="dir-add-search">
                <input
                  className="dir-add-input"
                  placeholder="Tìm điểm dừng để thêm..."
                  value={tourQuery}
                  onChange={(e) => setTourQuery(e.target.value)}
                />
                <button className="dir-icon-btn" onClick={() => setShowAddStop(true)}>
                  ➕
                </button>
              </div>
            )}

            {showAddStop && addStopCandidates.length > 0 && (
              <AddStopPanel
                title="Chọn điểm dừng"
                subtitle={subtitle}
                query={tourQuery}
                onQueryChange={setTourQuery}
                candidates={addStopCandidates}
                selectedIds={selectedStopIds}
                onToggleId={handleToggleStop}
                onSelectAll={handleSelectAllStops}
                onClear={handleClearStops}
                onStartMulti={handleStartMulti}
                isMultiRouting={isMultiRouting}
                onClose={() => setShowAddStop(false)}
              />
            )}

            <DirectionsSteps
              route={route}
              showAllSteps={showAllSteps}
              onToggle={() => setShowAllSteps((v) => !v)}
            />

            {tourPois.length > 0 && (
              <div className="dir-waypoint-list">
                {filteredTourPois.map((poi, idx) => (
                  <div key={poi.id} className="dir-waypoint-item">
                    <div className={`dir-waypoint-order ${idx === 0 ? "start" : ""}`}>{idx + 1}</div>
                    <div className="dir-waypoint-info">
                      <div className="dir-waypoint-name">{poi.name ?? ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isMobile && (
        <div className={`dir-bottom-sheet ${sheetExpanded ? "dir-bottom-sheet-open" : ""}`}>
          <button className="dir-close-btn" onClick={() => setShowDirections(false)} aria-label="Đóng chỉ đường">
            ✕
          </button>
          <div className="dir-bottom-sheet-handle" onClick={() => setSheetExpanded((v) => !v)} />
          <div className="dir-sheet-content">
            <div className="dir-tabbar">
              <button
                className={`dir-tab ${dirTab === "overview" ? "dir-tab-active" : ""}`}
                onClick={() => setDirTab("overview")}
              >
                Tổng quan
              </button>
              <button
                className={`dir-tab ${dirTab === "steps" ? "dir-tab-active" : ""}`}
                onClick={() => setDirTab("steps")}
              >
                Hành trình
              </button>
              <button
                className="dir-tab-hide"
                onClick={() => {
                  setShowDirections(false);
                  setSheetExpanded(false);
                }}
              >
                Ẩn
              </button>
              <button className="dir-tab-menu" onClick={toggleBottomNav}>
                {hideBottomNav ? "Hiện menu" : "Ẩn menu"}
              </button>
            </div>

            <div className="dir-profile">
              <button
                className={`dir-profile-btn ${profile === "walking" ? "dir-profile-btn-active" : ""}`}
                onClick={() => setProfile("walking")}
              >
                🚶 Đi bộ
              </button>
              <button
                className={`dir-profile-btn ${profile === "driving" ? "dir-profile-btn-active" : ""}`}
                onClick={() => setProfile("driving")}
              >
                🚗 Xe hơi
              </button>
              <button
                className={`dir-profile-btn ${profile === "cycling" ? "dir-profile-btn-active" : ""}`}
                onClick={() => setProfile("cycling")}
              >
                🏍️ Xe máy
              </button>
            </div>

            {dirTab === "overview" && (
              <>
                <div className="dir-route-info">
                  <div className="dir-route-stats">
                    <div className="dir-stat">
                      <div className="dir-stat-value">
                        {route ? `${Math.round(route.distanceMeters / 100) / 10} km` : "..."}
                      </div>
                      <div className="dir-stat-label">Tổng quãng đường</div>
                    </div>
                    <div className="dir-stat">
                      <div className="dir-stat-value">
                        {route ? `${Math.round(route.durationSeconds / 60)} phút` : "..."}
                      </div>
                      <div className="dir-stat-label">Thời gian ước tính</div>
                    </div>
                  </div>
                  <button
                    className="dir-start-btn"
                    onClick={() => {
                      showToast({
                        title: "Bắt đầu dẫn đường",
                        message: "Hệ thống đang theo dõi vị trí của bạn",
                      });
                    }}
                  >
                    🚗 Bắt đầu hành trình
                  </button>
                </div>

                {tourMeta && (
                  <div className="dir-waypoint-section">
                    <div className="dir-waypoint-title">Điểm dừng trong tour</div>
                    <div className="dir-waypoint-list">
                      {filteredTourPois
                        .slice(0, sheetExpanded ? undefined : 3)
                        .map((poi, idx) => (
                          <div key={poi.id} className="dir-waypoint-item">
                            <div className={`dir-waypoint-order ${idx === 0 ? "start" : ""}`}>{idx + 1}</div>
                            <div className="dir-waypoint-info">
                              <div className="dir-waypoint-name">{poi.name ?? "Đang tải..."}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                    {!sheetExpanded && filteredTourPois.length > 3 && (
                      <div className="dir-waypoint-more">
                        +{filteredTourPois.length - 3} điểm dừng khác • Kéo lên để xem thêm
                      </div>
                    )}
                    {filteredTourPois.length === 0 && (
                      <div className="dir-waypoint-empty">Chưa có điểm dừng.</div>
                    )}
                  </div>
                )}

                {addStopCandidates.length > 0 && (
                  <div className="dir-add-waypoint">
                    <input
                      className="dir-add-input"
                      placeholder="Thêm điểm dừng..."
                      value={tourQuery}
                      onChange={(e) => setTourQuery(e.target.value)}
                      onFocus={() => setSheetExpanded(true)}
                    />
                    <button className="dir-icon-btn" onClick={() => setShowAddStop(true)}>
                      ➕
                    </button>
                  </div>
                )}

                {showAddStop && addStopCandidates.length > 0 && (
                  <AddStopPanel
                    title="Chọn điểm dừng"
                    subtitle={subtitle}
                    query={tourQuery}
                    onQueryChange={setTourQuery}
                    candidates={addStopCandidates}
                    selectedIds={selectedStopIds}
                    onToggleId={handleToggleStop}
                    onSelectAll={handleSelectAllStops}
                    onClear={handleClearStops}
                    onStartMulti={handleStartMulti}
                    isMultiRouting={isMultiRouting}
                    onClose={() => setShowAddStop(false)}
                  />
                )}
              </>
            )}

            {dirTab === "steps" && (
              <DirectionsSteps
                route={route}
                showAllSteps={showAllSteps}
                onToggle={() => setShowAllSteps((v) => !v)}
              />
            )}

            {dirTab === "steps" && !route && <div className="dir-waypoint-empty">Đang tải lộ trình...</div>}
          </div>
        </div>
      )}
    </>
  );
}

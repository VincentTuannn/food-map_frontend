type AddStopCandidate = {
  id: string;
  name?: string;
  lat?: number;
  lng?: number;
};

type AddStopPanelProps = {
  title: string;
  subtitle: string;
  query: string;
  onQueryChange: (value: string) => void;
  candidates: AddStopCandidate[];
  selectedIds: Set<string>;
  onToggleId: (id: string, checked: boolean) => void;
  onSelectAll: () => void;
  onClear: () => void;
  onStartMulti: () => void;
  isMultiRouting: boolean;
  onClose: () => void;
};

export function AddStopPanel({
  title,
  subtitle,
  query,
  onQueryChange,
  candidates,
  selectedIds,
  onToggleId,
  onSelectAll,
  onClear,
  onStartMulti,
  isMultiRouting,
  onClose,
}: AddStopPanelProps) {
  const canStart = selectedIds.size > 0 && !isMultiRouting;

  return (
    <div className="add-stop-panel">
      <div className="add-stop-header">
        <div>
          <div className="add-stop-title">{title}</div>
          <div className="sectionSub">{subtitle}</div>
        </div>
        <button className="btn btnGhost" onClick={onClose}>
          Đóng
        </button>
      </div>
      <div className="add-stop-search">
        <span>🔎</span>
        <input
          className="tourSearchInput"
          placeholder="Tìm điểm dừng..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
      <div className="add-stop-actions">
        <button className="btn btnGhost" onClick={onSelectAll}>
          Chọn tất cả
        </button>
        <button className="btn btnGhost" onClick={onClear}>
          Bỏ chọn
        </button>
        <button className="btn btnPrimary" disabled={!canStart} onClick={onStartMulti}>
          {isMultiRouting ? "Đang tạo..." : "Chỉ đường nhiều điểm"}
        </button>
      </div>
      <div className="tourPoiList add-stop-list">
        {candidates.map((poi) => (
          <label key={poi.id} className="add-stop-item">
            <input
              type="checkbox"
              checked={selectedIds.has(poi.id)}
              onChange={(e) => onToggleId(poi.id, e.target.checked)}
            />
            <span className="add-stop-name">{poi.name ?? ""}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

type PoiListItem = {
  p: any;
  d?: number;
};

type PoiListSheetProps = {
  items: PoiListItem[];
  onClose: () => void;
  onOpenPoi: (poi: any) => void;
};

export function PoiListSheet({ items, onClose, onOpenPoi }: PoiListSheetProps) {
  return (
    <div style={{ position: "fixed", left: 14, right: 14, bottom: 86, zIndex: 12, pointerEvents: "auto" }}>
      <div className="poiSheet">
        <div className="poiSheetHeader">
          <div>
            <div className="sectionTitle">Gần bạn</div>
            <div className="sectionSub">{items.length} địa điểm</div>
          </div>
          <button className="btn btnGhost" onClick={onClose}>
            Ẩn
          </button>
        </div>
        <div className="poiSheetList">
          {items.map(({ p, d }) => (
            <div key={p.id} className="poiSheetItem">
              {p.imageUrl || p.image_url ? (
                <img className="poiThumb" src={p.imageUrl || p.image_url} alt={p.name} />
              ) : (
                <div className="poiThumb" aria-hidden="true" />
              )}
              <div>
                <div className="poiTitle">{p.name}</div>
                <div className="poiSub">
                  ⭐ {p.rating?.toFixed?.(1) ?? "-"}
                  {p.tags?.[0] ? ` · ${p.tags[0]}` : ""}
                </div>
                <div className="poiDistance">Cách bạn ~{Math.round(d ?? 0)}m</div>
              </div>
              <button className="btn btnPrimary" onClick={() => onOpenPoi(p)}>
                Xem
              </button>
            </div>
          ))}
          {items.length === 0 && <div className="muted" style={{ padding: 12 }}>Không có kết quả phù hợp.</div>}
        </div>
      </div>
    </div>
  );
}

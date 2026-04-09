import type { Poi } from "../../../shared/domain/poi";
import { PoiDetails } from "../PoiPage";

type PoiDetailsModalProps = {
  open: boolean;
  poi: Poi | null;
  loading: boolean;
  onClose: () => void;
};

export function PoiDetailsModal({ open, poi, loading, onClose }: PoiDetailsModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          background: "var(--bg)",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: "20px 20px calc(env(safe-area-inset-bottom) + 20px) 20px",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.3)",
          animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <style>{`
          @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        `}</style>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 40, height: 4, background: "var(--border)", borderRadius: 2 }} />
        </div>
        {loading && <div className="card cardPad">Đang tải...</div>}
        {!loading && poi && <PoiDetails poi={poi} />}
        {!loading && !poi && <div className="card cardPad">Không tìm thấy POI.</div>}
      </div>
    </div>
  );
}

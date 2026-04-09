import type { DirectionsRoute } from "../../../api/services/directions";

type DirectionsStepsProps = {
  route?: DirectionsRoute;
  showAllSteps: boolean;
  onToggle: () => void;
  maxCollapsed?: number;
};

export function DirectionsSteps({
  route,
  showAllSteps,
  onToggle,
  maxCollapsed = 6,
}: DirectionsStepsProps) {
  if (!route) return null;

  const visibleSteps = route.steps.slice(0, showAllSteps ? undefined : maxCollapsed);

  return (
    <div className="dir-steps">
      <div className="dir-steps-header">
        <div className="dir-steps-title">Hành trình chỉ đường</div>
        {route.steps.length > 4 && (
          <button className="dir-steps-toggle" onClick={onToggle}>
            {showAllSteps ? "Thu gọn" : "Xem thêm"}
          </button>
        )}
      </div>
      <div className={`dir-steps-list ${showAllSteps ? "dir-steps-list--full" : ""}`}>
        {visibleSteps.map((step, idx) => (
          <div key={idx} className="dir-step-item">
            <div className="dir-step-dot" />
            <div>
              <div className="dir-step-text">{step.instruction}</div>
              <div className="dir-step-meta">{Math.round(step.distanceMeters)}m</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

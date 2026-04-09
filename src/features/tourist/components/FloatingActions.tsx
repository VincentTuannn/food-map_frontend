type FloatingActionsProps = {
  showDirections: boolean;
  onToggleDirections: () => void;
  showPoiList: boolean;
  onTogglePoiList: () => void;
  ttsOn: boolean;
  onToggleTts: () => void;
  isTtsLoading: boolean;
  showTtsSettings: boolean;
  onToggleTtsSettings: () => void;
  selectedMurfGender: "female" | "male";
  onChangeMurfGender: (gender: "female" | "male") => void;
  selectedMurfVoice: string;
  onChangeMurfVoice: (voice: string) => void;
  murfVoices: { female: string; male: string };
  selectedSpeechLocale: string;
  onChangeSpeechLocale: (locale: string) => void;
  speechLocaleOptions: string[];
  ttsRate: number;
  onChangeTtsRate: (rate: number) => void;
};

export function FloatingActions({
  showDirections,
  onToggleDirections,
  showPoiList,
  onTogglePoiList,
  ttsOn,
  onToggleTts,
  isTtsLoading,
  showTtsSettings,
  onToggleTtsSettings,
  selectedMurfGender,
  onChangeMurfGender,
  selectedMurfVoice,
  onChangeMurfVoice,
  murfVoices,
  selectedSpeechLocale,
  onChangeSpeechLocale,
  speechLocaleOptions,
  ttsRate,
  onChangeTtsRate,
}: FloatingActionsProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        pointerEvents: "auto",
        alignItems: "flex-end",
        marginLeft: 16,
      }}
    >
      <button
        onClick={onToggleDirections}
        className="card"
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: showDirections ? "2px solid var(--brand)" : "1px solid var(--border)",
          background: showDirections ? "var(--panel-2)" : "var(--panel)",
          color: "var(--text)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          cursor: "pointer",
          fontSize: 18,
        }}
      >
        🗺️
      </button>
      <button
        onClick={onTogglePoiList}
        className="card"
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: showPoiList ? "2px solid var(--brand)" : "1px solid var(--border)",
          background: showPoiList ? "var(--panel-2)" : "var(--panel)",
          color: "var(--text)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          cursor: "pointer",
          fontSize: 18,
        }}
      >
        📋
      </button>
      <button
        onClick={onToggleTts}
        className="card"
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: ttsOn ? "2px solid var(--brand)" : "1px solid var(--border)",
          background: ttsOn ? "var(--brand)" : "var(--panel)",
          color: ttsOn ? "#fff" : "var(--text)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          cursor: "pointer",
          fontSize: 18,
        }}
      >
        {isTtsLoading ? "⏳" : ttsOn ? "🔊" : "🔈"}
      </button>
      <button
        onClick={onToggleTtsSettings}
        className="card"
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: showTtsSettings ? "2px solid var(--brand)" : "1px solid var(--border)",
          background: showTtsSettings ? "var(--panel-2)" : "var(--panel)",
          color: "var(--text)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          cursor: "pointer",
          fontSize: 18,
        }}
      >
        ⚙️
      </button>

      {showTtsSettings && (
        <div
          className="card cardPad"
          style={{
            width: 220,
            background: "var(--panel)",
            backdropFilter: "blur(16px)",
            marginTop: 4,
            textAlign: "left",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Giọng đọc TTS</div>
          <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 12 }}>Murf Voice</div>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <select
              className="select"
              value={selectedMurfGender}
              onChange={(e) => onChangeMurfGender(e.target.value as "female" | "male")}
              style={{ fontSize: 13, padding: "8px", width: 110 }}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
            <select
              className="select"
              value={selectedMurfVoice}
              onChange={(e) => onChangeMurfVoice(e.target.value)}
              style={{ fontSize: 13, padding: "8px", flex: 1 }}
            >
              <option value={murfVoices.female}>{murfVoices.female}</option>
              <option value={murfVoices.male}>{murfVoices.male}</option>
            </select>
          </div>
          <div style={{ height: 8 }} />
          <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 12 }}>Web Speech (fallback)</div>
          <select
            className="select"
            value={selectedSpeechLocale}
            onChange={(e) => onChangeSpeechLocale(e.target.value)}
            style={{ fontSize: 13, padding: "8px" }}
          >
            {speechLocaleOptions.map((locale) => (
              <option key={locale} value={locale}>
                {locale}
              </option>
            ))}
          </select>
          <div style={{ height: 8 }} />
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Tốc độ đọc</div>
          <select
            className="select"
            value={ttsRate}
            onChange={(e) => onChangeTtsRate(Number(e.target.value))}
            style={{ fontSize: 13, padding: "8px" }}
          >
            <option value={0.8}>0.8x</option>
            <option value={1}>1.0x</option>
            <option value={1.2}>1.2x</option>
            <option value={1.5}>1.5x</option>
          </select>
        </div>
      )}
    </div>
  );
}

import { useRef, useState, useEffect } from "react";

interface AudioPlayerProps {
  audioUrl: string;
  onClose: () => void;
  poiName: string;
}

function AudioPlayer({ audioUrl, onClose, poiName }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.play().then(() => setPlaying(true)).catch(() => {});
    const onTime = () => setProgress(el.currentTime);
    const onMeta = () => setDuration(el.duration);
    const onEnd = () => setPlaying(false);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('ended', onEnd);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onMeta);
      el.removeEventListener('ended', onEnd);
      el.pause();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { el.play(); setPlaying(true); }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed bottom-[88px] left-0 right-0 z-50 px-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-[800px] mx-auto bg-gray-900 text-white rounded-2xl p-4 shadow-2xl border border-white/10">
        <audio ref={audioRef} src={audioUrl} preload="auto" />
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-[#FF6B35] flex items-center justify-center shrink-0 hover:bg-[#F25A24] transition-colors"
          >
            {playing
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
            }
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold truncate opacity-70 mb-1">{poiName}</div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#FF6B35] rounded-full transition-all duration-200" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-[10px] opacity-50 mt-1">
              <span>{fmt(progress)}</span><span>{duration > 0 ? fmt(duration) : '--:--'}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;
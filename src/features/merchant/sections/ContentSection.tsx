import { useEffect, useState } from 'react'
import { generatePoiAudio, getTtsCredits, getTtsVoices, translateAndCreatePoiContent, updatePoiContentByLanguage, type TtsCredits, type TtsVoice } from '../../../api/services/merchant'
import { LANGS } from '../merchantConstants'
import { getPoiContents } from '../merchantHelpers'
import type { Poi, PoiContent } from '../merchantTypes'

export function ContentSection({ pois, toast }: { pois: Poi[]; toast: (m: string) => void }) {
  const [selectedPoi, setSelectedPoi] = useState<string>('')
  const [activeLang, setActiveLang] = useState('vi')
  const [contents, setContents] = useState<Record<string, PoiContent>>({})
  const [desc, setDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [credits, setCredits] = useState<TtsCredits | null>(null)
  const [voices, setVoices] = useState<TtsVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState('')

  useEffect(() => {
    if (!selectedPoi) return
    getPoiContents(selectedPoi).then((data: PoiContent[]) => {
      const map: Record<string, PoiContent> = {}
      data?.forEach?.((c) => { map[c.language_code] = c })
      setContents(map)
    }).catch(() => setContents({}))
    getTtsCredits().then((d) => setCredits(d)).catch(() => {})
    getTtsVoices().then((d) => { setVoices(d); setSelectedVoice(d?.[0]?.name ?? d?.[0]?.id ?? '') }).catch(() => {})
  }, [selectedPoi])

  useEffect(() => { setDesc(contents[activeLang]?.description ?? '') }, [contents, activeLang])

  const saveContent = async () => {
    if (!selectedPoi) return
    setSaving(true)
    try {
      const updated = await updatePoiContentByLanguage(selectedPoi, activeLang, { description: desc, voice: selectedVoice })
      setContents((c) => ({ ...c, [activeLang]: updated as PoiContent }))
      toast('Đã lưu nội dung')
    } catch {
      toast('Lỗi khi lưu')
    } finally {
      setSaving(false)
    }
  }

  const genAudio = async () => {
    if (!selectedPoi) return
    setGenerating(true)
    try {
      await generatePoiAudio(selectedPoi, activeLang)
      toast('Đã tạo audio thành công!')
      const data = await getPoiContents(selectedPoi)
      const map: Record<string, PoiContent> = {}
      data?.forEach?.((c: PoiContent) => { map[c.language_code] = c })
      setContents(map)
    } catch {
      toast('Lỗi khi tạo audio')
    } finally {
      setGenerating(false)
    }
  }

  const translateAll = async () => {
    if (!selectedPoi || !desc.trim()) return
    setTranslating(true)
    try {
      await translateAndCreatePoiContent(selectedPoi, { source_lang: activeLang, text: desc })
      toast('Đã dịch & tạo nội dung tất cả ngôn ngữ!')
      const data = await getPoiContents(selectedPoi)
      const map: Record<string, PoiContent> = {}
      data?.forEach?.((c: PoiContent) => { map[c.language_code] = c })
      setContents(map)
    } catch {
      toast('Lỗi khi dịch')
    } finally {
      setTranslating(false)
    }
  }

  const currentContent = contents[activeLang]
  const remainingCredits = credits?.remaining ?? credits?.total

  return (
    <>
      <div className="md-stagger">
        <div className="md-card">
          <div className="md-card-label">Bước 1</div>
          <div className="md-card-title" style={{ marginBottom: 14 }}>Chọn địa điểm</div>
          <select className="md-select" value={selectedPoi} onChange={(e) => setSelectedPoi(e.target.value)}>
            <option value="">— Chọn POI —</option>
            {pois.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {remainingCredits !== undefined && (
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
              💳 TTS Credits còn lại: <strong style={{ color: 'var(--ink)' }}>{remainingCredits}</strong>
            </div>
          )}
        </div>

        {selectedPoi && (
          <>
            <div className="md-card">
              <div className="md-card-label">Bước 2</div>
              <div className="md-card-title" style={{ marginBottom: 14 }}>Chọn ngôn ngữ & soạn nội dung</div>
              <div className="lang-chips">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    className={`lang-chip${activeLang === l.code ? ' active' : ''}`}
                    onClick={() => setActiveLang(l.code)}
                  >
                    {l.label}
                    {contents[l.code] && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', display: 'inline-block' }} />}
                  </button>
                ))}
              </div>

              <div className="md-field">
                <label className="md-label">Mô tả / Script thuyết minh ({activeLang.toUpperCase()})</label>
                <textarea className="md-textarea" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Nhập nội dung giới thiệu địa điểm…" style={{ minHeight: 130 }} />
              </div>

              <div className="md-row" style={{ marginTop: 12 }}>
                <button className="btn-primary" onClick={saveContent} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu nội dung'}</button>
                <button className="btn-secondary" onClick={translateAll} disabled={translating}>{translating ? 'Đang dịch…' : '🌐 Dịch tất cả ngôn ngữ'}</button>
              </div>
            </div>

            <div className="md-card">
              <div className="md-card-label">Bước 3 — AI TTS</div>
              <div className="md-card-title" style={{ marginBottom: 6 }}>Tạo audio giọng đọc</div>
              <div className="md-card-sub" style={{ marginBottom: 16 }}>Chuyển văn bản thành giọng nói tự nhiên bằng AI</div>

              {voices.length > 0 && (
                <div className="md-field" style={{ marginBottom: 14 }}>
                  <label className="md-label">Giọng đọc</label>
                  <select className="md-select" value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}>
                    {voices.map((v) => <option key={v.id ?? v.name} value={v.name ?? v.id ?? ''}>{v.name ?? v.id}</option>)}
                  </select>
                </div>
              )}

              <div className="md-row">
                <button className="btn-primary" onClick={genAudio} disabled={generating || !desc.trim()}>
                  {generating ? 'Đang tạo audio…' : '🎙 Tạo audio ngay'}
                </button>
              </div>

              {currentContent?.audio_url && (
                <div style={{ marginTop: 16 }}>
                  <div className="md-label" style={{ marginBottom: 6 }}>Preview audio ({activeLang.toUpperCase()})</div>
                  <audio controls src={currentContent.audio_url} style={{ width: '100%', borderRadius: 8 }} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

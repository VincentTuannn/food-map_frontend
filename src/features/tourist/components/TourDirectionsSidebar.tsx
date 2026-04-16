/**
 * TourDirectionsSidebar.tsx
 *
 * Thay thế toàn bộ đoạn {sidebarTab === 'directions' && (...)}
 * trong MapPage.tsx
 *
 * Tính năng:
 *   ✅ Tour stops: expand animation mượt + POI info + nút Nghe
 *   ✅ Directions: Google Maps-style step-by-step với icon hướng đi
 *   ✅ Hiệu ứng: stagger reveal, glow active step, animated timeline
 *   ✅ TypeScript strict
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  MapPin, Headphones, ChevronDown, Navigation, Clock,
  CornerUpRight, CornerUpLeft, ArrowUp, RotateCw,
  AlertCircle, Trash2, Route as RouteIcon, Star,
  Utensils, Coffee, Camera, Ticket,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TourPoi {
  id?: string
  name: string
  address?: string
  description?: string
  category?: 'food' | 'drink' | 'sight' | string
  rating?: number | string
  lat?: number
  lng?: number
  audioDuration?: number
  audioUrl?: string
}

interface RouteStep {
  maneuver: {
    instruction: string
    type?: string
    modifier?: string
  }
  distance: number
  duration?: number
}

interface RouteLeg {
  steps: RouteStep[]
}

interface RouteData {
  destinationName?: string
  duration: number  // seconds
  distance: number  // meters
  legs: RouteLeg[]
}

interface Props {
  tourPoints: TourPoi[]
  routeData: RouteData | null
  isTtsLoading: boolean
  onListen: (poi: TourPoi) => void
  onEndTour: () => void
  t?: (key: string, fallback: string) => string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Map maneuver type → Lucide icon component */
function ManeuverIcon({ type, modifier, size = 16 }: { type?: string; modifier?: string; size?: number }) {
  const cls = 'shrink-0'
  if (type === 'turn') {
    if (modifier === 'left' || modifier === 'sharp left' || modifier === 'slight left')
      return <CornerUpLeft size={size} className={cls} />
    if (modifier === 'right' || modifier === 'sharp right' || modifier === 'slight right')
      return <CornerUpRight size={size} className={cls} />
    if (modifier === 'uturn')
      return <RotateCw size={size} className={cls} />
  }
  if (type === 'arrive') return <MapPin size={size} className={cls} />
  if (type === 'depart') return <Navigation size={size} className={cls} />
  return <ArrowUp size={size} className={cls} />
}

/** Category → icon + color */
function getCategoryMeta(cat?: string) {
  switch (cat) {
    case 'food':  return { icon: <Utensils size={12} />, label: 'Ẩm thực', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' }
    case 'drink': return { icon: <Coffee size={12} />,    label: 'Cà phê',  bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200' }
    case 'sight': return { icon: <Camera size={12} />,    label: 'Tham quan',bg: 'bg-sky-100',   text: 'text-sky-700',    border: 'border-sky-200' }
    default:      return { icon: <Ticket size={12} />,    label: 'Địa điểm',bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200' }
  }
}

function fmtDist(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`
}
function fmtTime(s: number) {
  const m = Math.round(s / 60)
  return m < 60 ? `${m} phút` : `${Math.floor(m / 60)}g ${m % 60}p`
}

// ─── Animated number counter ───────────────────────────────────────────────────

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = to / 30
    const timer = setInterval(() => {
      start += step
      if (start >= to) { setVal(to); clearInterval(timer) }
      else setVal(Math.round(start))
    }, 20)
    return () => clearInterval(timer)
  }, [to])
  return <span>{val}{suffix}</span>
}

// ─── Tour stop card ────────────────────────────────────────────────────────────

interface StopCardProps {
  poi: TourPoi
  index: number
  total: number
  isExpanded: boolean
  isVisible: boolean
  onToggle: () => void
  onListen: (poi: TourPoi) => void
  isTtsLoading: boolean
}

function StopCard({ poi, index, total, isExpanded, isVisible, onToggle, onListen, isTtsLoading }: StopCardProps) {
  const catMeta = getCategoryMeta(poi.category)
  const isLast  = index === total - 1
  const isFirst = index === 0

  return (
    <div
      className="relative z-10 mb-3"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.4s ease ${index * 60}ms, transform 0.4s ease ${index * 60}ms`,
      }}
    >
      {/* ── Clickable header row ── */}
      <div
        onClick={onToggle}
        className={[
          'flex items-center gap-3 cursor-pointer select-none group',
          'rounded-2xl border transition-all duration-300',
          isExpanded
            ? 'rounded-b-none bg-white border-[#FF6B35]/30 shadow-lg shadow-[#FF6B35]/10'
            : 'bg-white/80 border-white/60 hover:border-[#FF6B35]/25 hover:bg-white hover:shadow-md',
          'px-3 py-3',
        ].join(' ')}
      >
        {/* Step circle */}
        <div className={[
          'flex items-center justify-center w-9 h-9 rounded-full shrink-0 font-extrabold text-[13px]',
          'border-[2.5px] transition-all duration-300 shadow-sm',
          isFirst
            ? 'bg-[#FF6B35] border-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/30'
            : isLast
            ? 'bg-gray-800 border-gray-700 text-white'
            : isExpanded
            ? 'bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-500/30'
            : 'bg-white border-gray-200 text-gray-500 group-hover:border-[#FF6B35]/50 group-hover:text-[#FF6B35]',
        ].join(' ')}>
          {index + 1}
        </div>

        {/* POI name + address */}
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-[14px] leading-snug truncate transition-colors duration-200 ${isExpanded ? 'text-[#FF6B35]' : 'text-gray-800 group-hover:text-[#FF6B35]'}`}>
            {poi.name}
          </div>
          {poi.address && (
            <div className="text-[11px] text-gray-400 truncate mt-0.5 flex items-center gap-1">
              <MapPin size={9} className="shrink-0" />
              {poi.address}
            </div>
          )}
          {poi.audioDuration && (
            <div className="text-[10px] text-violet-500 font-semibold mt-0.5 flex items-center gap-1">
              <Headphones size={9} />
              ~{poi.audioDuration}s thuyết minh
            </div>
          )}
        </div>

        {/* Chevron */}
        <ChevronDown
          size={18}
          className={`shrink-0 transition-all duration-300 ${isExpanded ? 'rotate-180 text-[#FF6B35]' : 'text-gray-300 group-hover:text-[#FF6B35]/60'}`}
        />
      </div>

      {/* ── Expanded panel ── */}
      <div
        className={[
          'overflow-hidden transition-all duration-500 ease-in-out',
          'rounded-b-2xl border border-t-0 bg-gradient-to-b from-white to-orange-50/30',
          isExpanded ? 'border-[#FF6B35]/20' : 'border-transparent',
        ].join(' ')}
        style={{ maxHeight: isExpanded ? 400 : 0, opacity: isExpanded ? 1 : 0 }}
      >
        <div className="px-4 pb-4 pt-3">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${catMeta.bg} ${catMeta.text} ${catMeta.border}`}>
              {catMeta.icon} {catMeta.label}
            </span>
            {poi.rating && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <Star size={9} fill="currentColor" /> {poi.rating}
              </span>
            )}
            {poi.audioDuration && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-200">
                <Headphones size={9} /> {poi.audioDuration}s
              </span>
            )}
          </div>

          {/* Description */}
          {poi.description && (
            <p className="text-[12px] text-gray-600 leading-relaxed mb-3 border-l-2 border-[#FF6B35]/30 pl-3">
              {poi.description}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onListen(poi)}
              disabled={isTtsLoading}
              className={[
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl',
                'font-bold text-[12px] transition-all duration-200 active:scale-95',
                'bg-gradient-to-r from-violet-500 to-violet-600 text-white',
                'shadow-md shadow-violet-500/30 hover:shadow-lg hover:shadow-violet-500/40',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              ].join(' ')}
            >
              {isTtsLoading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Headphones size={15} />
              }
              Nghe thuyết minh
            </button>

            <button
              className="px-3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all duration-200 active:scale-95"
              title={`#${poi.id || (index + 1)}`}
            >
              <MapPin size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Direction step card ────────────────────────────────────────────────────────

interface StepCardProps {
  step: RouteStep
  idx: number
  total: number
  isActive: boolean
  isVisible: boolean
  onClick: () => void
}

function DirectionStepCard({ step, idx, total, isActive, isVisible, onClick }: StepCardProps) {
  const isLast = idx === total - 1
  const { type, modifier } = step.maneuver

  // Color per step type
  const accentColor = isLast
    ? '#10B981'  // arrive = green
    : idx === 0
    ? '#3B82F6'  // depart = blue
    : '#FF6B35'  // steps = orange

  return (
    <div
      onClick={onClick}
      className="relative flex items-start gap-3 cursor-pointer group z-10"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(-12px)',
        transition: `opacity 0.35s ease ${idx * 45}ms, transform 0.35s ease ${idx * 45}ms`,
      }}
    >
      {/* Icon circle */}
      <div
        className={[
          'flex items-center justify-center w-9 h-9 rounded-full shrink-0 mt-0.5',
          'border-[2.5px] border-white shadow-md transition-all duration-300',
          isActive ? 'scale-110 ring-4' : 'group-hover:scale-105',
        ].join(' ')}
        style={{
          background: isActive
            ? `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`
            : `${accentColor}18`,
          color: isActive ? '#fff' : accentColor,
          ringColor: `${accentColor}30`,
          boxShadow: isActive ? `0 4px 14px ${accentColor}40` : undefined,
        } as React.CSSProperties}
      >
        <ManeuverIcon type={type} modifier={modifier} size={15} />
      </div>

      {/* Card */}
      <div
        className={[
          'flex-1 mb-3 p-3 rounded-2xl border transition-all duration-300',
          isActive
            ? 'bg-white border-[#FF6B35]/30 shadow-lg shadow-[#FF6B35]/8'
            : 'bg-white/70 border-white/50 group-hover:bg-white group-hover:border-gray-100 group-hover:shadow-sm',
        ].join(' ')}
      >
        <p className={`font-semibold text-[13px] leading-snug ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
          {step.maneuver.instruction}
        </p>

        <div className="flex items-center gap-3 mt-1.5">
          {step.distance > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: accentColor }}>
              <ArrowUp size={9} />
              {fmtDist(step.distance)}
            </span>
          )}
          {step.duration != null && step.duration > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
              <Clock size={9} />
              {fmtTime(step.duration)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────

export function TourDirectionsSidebar({
  tourPoints,
  routeData,
  isTtsLoading,
  onListen,
  onEndTour,
  t = (_k, fb) => fb,
}: Props) {
  const [expandedStopIdx, setExpandedStopIdx] = useState<number>(0)
  const [activeStepIdx,   setActiveStepIdx]   = useState<number>(0)
  const [stopsVisible,    setStopsVisible]     = useState(false)
  const [stepsVisible,    setStepsVisible]     = useState(false)

  // Stagger reveal on mount
  useEffect(() => {
    const t1 = setTimeout(() => setStopsVisible(true), 80)
    const t2 = setTimeout(() => setStepsVisible(true), 80)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // Reset active step when route changes
  useEffect(() => { setActiveStepIdx(0) }, [routeData])

  const steps = routeData?.legs?.[0]?.steps ?? []

  // ── Tour stops mode ──────────────────────────────────────────────────────────

  if (tourPoints.length > 0) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#FF6B35]/10">
            <RouteIcon size={16} className="text-[#FF6B35]" />
          </div>
          <div>
            <h3 className="text-[15px] font-extrabold text-gray-900 leading-none">
              {t('tourist.map.directionsTitle', 'Lộ trình hành trình')}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {tourPoints.length} điểm dừng
            </p>
          </div>
        </div>

        {/* Scrollable stops list */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-2 relative">
          {/* Animated timeline line */}
          <div
            className="absolute left-[17px] top-2 w-[2px] rounded-full z-0"
            style={{
              height: `calc(100% - 80px)`,
              background: 'linear-gradient(to bottom, #FF6B35 0%, #a78bfa 40%, #10B981 100%)',
              opacity: 0.25,
            }}
          />

          {tourPoints.map((poi, idx) => (
            <StopCard
              key={poi.id || idx}
              poi={poi}
              index={idx}
              total={tourPoints.length}
              isExpanded={expandedStopIdx === idx}
              isVisible={stopsVisible}
              onToggle={() => setExpandedStopIdx(expandedStopIdx === idx ? -1 : idx)}
              onListen={onListen}
              isTtsLoading={isTtsLoading}
            />
          ))}
        </div>

        {/* End tour CTA */}
        <div className="shrink-0 pt-3 border-t border-gray-100">
          <button
            onClick={onEndTour}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-extrabold text-[14px] transition-all duration-200 active:scale-[0.98] shadow-lg"
          >
            <Trash2 size={16} />
            {t('tourist.map.endTour', 'Kết thúc Hành trình')}
          </button>
        </div>
      </div>
    )
  }

  // ── Route directions mode (Google Maps style) ────────────────────────────────

  if (routeData && steps.length > 0) {
    const totalMin = Math.round(routeData.duration / 60)
    const totalKm  = (routeData.distance / 1000).toFixed(1)

    return (
      <div className="h-full flex flex-col gap-0">

        {/* ── Summary card ── */}
        <div
          className="shrink-0 mb-4 rounded-2xl overflow-hidden shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #FF7A45 0%, #FF512F 50%, #1a1a2e 100%)',
          }}
        >
          {/* Top: destination */}
          <div className="flex items-start justify-between px-4 pt-4 pb-3">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-0.5">
                {t('tourist.map.to', 'Điểm đến')}
              </div>
              <div className="text-[17px] font-extrabold text-white leading-tight line-clamp-2 drop-shadow">
                {routeData.destinationName ?? 'Điểm đến'}
              </div>
            </div>
            <div className="ml-3 shrink-0 flex flex-col items-end">
              <div className="text-[26px] font-black text-white leading-none">
                <CountUp to={totalMin} suffix=" phút" />
              </div>
              <div className="text-[12px] text-white/70 font-medium mt-0.5">{totalKm} km</div>
            </div>
          </div>

          {/* Bottom progress bar */}
          <div className="px-4 pb-3">
            <div className="flex justify-between text-[10px] text-white/60 mb-1.5 font-semibold">
              <span>Đi bộ</span>
              <span>Bước {activeStepIdx + 1}/{steps.length}</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${((activeStepIdx + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Step list ── */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-2 relative">
          {/* Timeline connector */}
          <div
            className="absolute left-[17px] top-4 w-[2px] rounded-full z-0"
            style={{
              height: 'calc(100% - 32px)',
              background: 'linear-gradient(to bottom, #3B82F6, #FF6B35 50%, #10B981)',
              opacity: 0.2,
            }}
          />

          {steps.map((step, idx) => (
            <DirectionStepCard
              key={idx}
              step={step}
              idx={idx}
              total={steps.length}
              isActive={activeStepIdx === idx}
              isVisible={stepsVisible}
              onClick={() => setActiveStepIdx(idx)}
            />
          ))}
        </div>

        {/* ── Bottom action row ── */}
        <div className="shrink-0 pt-3 border-t border-gray-100 flex gap-2">
          <button
            onClick={() => setActiveStepIdx(s => Math.max(0, s - 1))}
            disabled={activeStepIdx === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-[13px] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ‹ Trước
          </button>
          <button
            onClick={() => setActiveStepIdx(s => Math.min(steps.length - 1, s + 1))}
            disabled={activeStepIdx === steps.length - 1}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#FF6B35] text-white font-bold text-[13px] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F25A24] shadow-md shadow-[#FF6B35]/30"
          >
            Tiếp ›
          </button>
        </div>
      </div>
    )
  }

  // ── Empty state ──────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6 gap-3">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-1">
        <AlertCircle size={28} className="text-gray-300" />
      </div>
      <p className="text-[14px] font-bold text-gray-500">Chưa có hành trình</p>
      <p className="text-[12px] text-gray-400 leading-relaxed">
        Chọn một địa điểm trên bản đồ và bấm <strong>"Chỉ đường"</strong>, hoặc bắt đầu từ trang Tour.
      </p>
    </div>
  )
}
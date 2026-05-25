import React, { useContext, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import {
  HeroSection,
  WeatherCard,
  MetricCard,
  ForecastCard,
  LoadingScreen,
} from '../components'
import { LocationContext } from '../App'
import { fetchWeatherData, WeatherData } from '../services/api/weather'

// ======================================================
// TYPES
// ======================================================

interface HourlyForecast {
  hour: string
  temp: number
  condition: string
  humidity: number
  windSpeed: number
  icon: string
}

interface DayForecast {
  day: string
  shortDay: string
  high: number
  low: number
  condition: string
  icon: string
  humidity: number
  precipChance: number
}

type WeatherMood = 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy'

// ======================================================
// CONSTANTS & HELPERS
// ======================================================

const CONDITION_MAP: Record<string, { mood: WeatherMood; icon: string; label: string }> = {
  clear:   { mood: 'clear',   icon: '☀️',  label: 'Clear Skies'  },
  sunny:   { mood: 'clear',   icon: '☀️',  label: 'Sunny'        },
  cloud:   { mood: 'cloudy',  icon: '☁️',  label: 'Overcast'     },
  fog:     { mood: 'foggy',   icon: '🌫️', label: 'Foggy'        },
  rain:    { mood: 'rainy',   icon: '🌧️', label: 'Rain'         },
  drizzle: { mood: 'rainy',   icon: '🌦️', label: 'Drizzle'      },
  thunder: { mood: 'stormy',  icon: '⛈️',  label: 'Thunderstorm' },
  storm:   { mood: 'stormy',  icon: '🌩️', label: 'Storm'        },
  snow:    { mood: 'snowy',   icon: '❄️',  label: 'Snow'         },
}

function parseCondition(raw: string) {
  const lower = raw?.toLowerCase() ?? ''
  for (const [key, val] of Object.entries(CONDITION_MAP)) {
    if (lower.includes(key)) return val
  }
  return { mood: 'clear' as WeatherMood, icon: '🌤️', label: raw || 'Partly Cloudy' }
}

const MOOD_PALETTES: Record<WeatherMood, {
  bg: string[]
  orb1: string
  orb2: string
  orb3: string
  accent: string
  text: string
  subtext: string
  card: string
  border: string
  glow: string
}> = {
  clear: {
    bg: ['#0a0f1e', '#0d1b3e', '#102050'],
    orb1: 'rgba(255,180,50,0.22)',
    orb2: 'rgba(255,120,20,0.12)',
    orb3: 'rgba(80,160,255,0.10)',
    accent: '#f5c842',
    text: '#fff8e7',
    subtext: 'rgba(255,240,190,0.6)',
    card: 'rgba(255,220,100,0.05)',
    border: 'rgba(255,210,80,0.15)',
    glow: '0 0 80px rgba(255,180,50,0.18)',
  },
  cloudy: {
    bg: ['#0d1220', '#131a2e', '#151e30'],
    orb1: 'rgba(140,160,200,0.18)',
    orb2: 'rgba(100,130,180,0.10)',
    orb3: 'rgba(80,100,150,0.10)',
    accent: '#90aad4',
    text: '#dce8ff',
    subtext: 'rgba(180,210,255,0.55)',
    card: 'rgba(100,140,200,0.05)',
    border: 'rgba(120,160,220,0.12)',
    glow: '0 0 80px rgba(100,140,200,0.15)',
  },
  rainy: {
    bg: ['#080d18', '#0c1222', '#0e1628'],
    orb1: 'rgba(60,120,220,0.22)',
    orb2: 'rgba(40,80,180,0.14)',
    orb3: 'rgba(20,60,140,0.10)',
    accent: '#5ba3ff',
    text: '#c8e0ff',
    subtext: 'rgba(150,200,255,0.55)',
    card: 'rgba(60,120,255,0.05)',
    border: 'rgba(80,140,255,0.15)',
    glow: '0 0 80px rgba(60,120,220,0.20)',
  },
  stormy: {
    bg: ['#060810', '#0a0c18', '#0c0e1e'],
    orb1: 'rgba(180,120,255,0.20)',
    orb2: 'rgba(100,60,200,0.14)',
    orb3: 'rgba(60,180,220,0.08)',
    accent: '#c084fc',
    text: '#ede0ff',
    subtext: 'rgba(210,180,255,0.55)',
    card: 'rgba(140,80,255,0.05)',
    border: 'rgba(160,100,255,0.15)',
    glow: '0 0 100px rgba(180,100,255,0.22)',
  },
  snowy: {
    bg: ['#0b1020', '#101828', '#131e30'],
    orb1: 'rgba(180,220,255,0.18)',
    orb2: 'rgba(140,200,255,0.12)',
    orb3: 'rgba(100,180,255,0.08)',
    accent: '#a8d8ff',
    text: '#e8f4ff',
    subtext: 'rgba(200,230,255,0.55)',
    card: 'rgba(150,210,255,0.05)',
    border: 'rgba(160,210,255,0.14)',
    glow: '0 0 80px rgba(160,210,255,0.16)',
  },
  foggy: {
    bg: ['#0c0e14', '#111318', '#14161e'],
    orb1: 'rgba(160,165,180,0.16)',
    orb2: 'rgba(130,140,160,0.10)',
    orb3: 'rgba(100,110,130,0.08)',
    accent: '#a8afc4',
    text: '#d8dce8',
    subtext: 'rgba(180,190,210,0.55)',
    card: 'rgba(140,150,170,0.05)',
    border: 'rgba(150,160,180,0.12)',
    glow: '0 0 80px rgba(140,150,170,0.14)',
  },
}

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ======================================================
// SUB-COMPONENTS
// ======================================================

// Cinematic ambient background with animated orbs
const AmbientBackground: React.FC<{ mood: WeatherMood }> = ({ mood }) => {
  const pal = MOOD_PALETTES[mood]
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: `radial-gradient(ellipse at 30% 20%, ${pal.bg[1]}, ${pal.bg[0]} 60%)`,
        transition: 'background 2s ease',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Noise texture overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
        opacity: 0.6,
      }} />
      {/* Orb 1 */}
      <motion.div
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: '55vw', height: '55vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${pal.orb1}, transparent 70%)`,
          filter: 'blur(60px)',
          transition: 'background 2s ease',
        }}
      />
      {/* Orb 2 */}
      <motion.div
        animate={{ x: [0, -50, 30, 0], y: [0, 40, -20, 0], scale: [1, 0.90, 1.10, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        style={{
          position: 'absolute', top: '30%', right: '-10%',
          width: '45vw', height: '45vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${pal.orb2}, transparent 70%)`,
          filter: 'blur(80px)',
          transition: 'background 2s ease',
        }}
      />
      {/* Orb 3 */}
      <motion.div
        animate={{ x: [0, 25, -35, 0], y: [0, -25, 35, 0], scale: [1, 1.08, 0.92, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
        style={{
          position: 'absolute', bottom: '5%', left: '25%',
          width: '40vw', height: '40vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${pal.orb3}, transparent 70%)`,
          filter: 'blur(70px)',
          transition: 'background 2s ease',
        }}
      />
      {/* Horizontal scanline shimmer */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.008) 3px, rgba(255,255,255,0.008) 4px)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

// Rain particle system
const RainSystem: React.FC<{ intensity?: number }> = ({ intensity = 30 }) => {
  const drops = Array.from({ length: intensity }, (_, i) => i)
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
      {drops.map(i => (
        <motion.div
          key={i}
          animate={{ y: ['0vh', '110vh'], opacity: [0, 0.6, 0.6, 0] }}
          transition={{
            duration: 0.8 + Math.random() * 0.8,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20}%`,
            width: '1px',
            height: `${40 + Math.random() * 60}px`,
            background: 'linear-gradient(to bottom, transparent, rgba(130,190,255,0.5))',
            borderRadius: '1px',
          }}
        />
      ))}
    </div>
  )
}

// Snow particle system
const SnowSystem: React.FC = () => {
  const flakes = Array.from({ length: 40 }, (_, i) => i)
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
      {flakes.map(i => {
        const size = 3 + Math.random() * 5
        return (
          <motion.div
            key={i}
            animate={{
              y: ['0vh', '110vh'],
              x: [0, Math.sin(i) * 80],
              rotate: [0, 360],
              opacity: [0, 0.8, 0.8, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 10}%`,
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              background: 'rgba(200,230,255,0.7)',
              filter: 'blur(0.5px)',
            }}
          />
        )
      })}
    </div>
  )
}

// Lightning flash for stormy conditions
const LightningSystem: React.FC = () => {
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    const cycle = () => {
      const delay = 4000 + Math.random() * 8000
      setTimeout(() => {
        setFlash(true)
        setTimeout(() => setFlash(false), 80)
        setTimeout(() => {
          setFlash(true)
          setTimeout(() => setFlash(false), 60)
        }, 120)
        cycle()
      }, delay)
    }
    cycle()
  }, [])
  return (
    <AnimatePresence>
      {flash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.04 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 2,
            background: 'rgba(220,200,255,0.07)',
            pointerEvents: 'none',
          }}
        />
      )}
    </AnimatePresence>
  )
}

// Giant temperature hero display
const TemperatureHero: React.FC<{
  temp: number
  feelsLike: number
  condition: string
  icon: string
  label: string
  city: string
  pal: typeof MOOD_PALETTES['clear']
}> = ({ temp, feelsLike, condition, icon, label, city, pal }) => {
  const displayTemp = Math.round(temp)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0.5rem',
        paddingBottom: '2rem',
      }}
    >
      {/* City + condition badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
        <span style={{
          fontSize: '0.7rem', fontFamily: '"Courier New", monospace',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: pal.subtext,
        }}>
          {city}
        </span>
        <span style={{
          fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase',
          color: pal.accent, fontWeight: 600,
          background: `${pal.accent}18`,
          border: `1px solid ${pal.accent}30`,
          borderRadius: '100px',
          padding: '2px 10px',
        }}>
          {label}
        </span>
      </div>

      {/* Main temperature */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: 1 }}>
        <motion.span
          key={displayTemp}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            fontSize: 'clamp(5rem, 15vw, 10rem)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: pal.text,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 0.9,
            textShadow: pal.glow,
          }}
        >
          {displayTemp}
        </motion.span>
        <span style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 300,
          color: pal.subtext,
          marginTop: '0.5rem',
        }}>°C</span>
        <motion.span
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 0.95, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            fontSize: 'clamp(3rem, 8vw, 5.5rem)',
            lineHeight: 1,
            marginTop: '0.25rem',
            filter: 'drop-shadow(0 0 20px rgba(255,200,80,0.3))',
          }}
        >
          {icon}
        </motion.span>
      </div>

      {/* Feels like */}
      <p style={{
        fontSize: '0.85rem', color: pal.subtext, letterSpacing: '0.04em',
        marginTop: '0.25rem',
      }}>
        Feels like&nbsp;
        <span style={{ color: pal.text, fontWeight: 600 }}>{Math.round(feelsLike)}°</span>
        &nbsp;·&nbsp;{condition}
      </p>
    </motion.div>
  )
}

// Glassy stat pill
const StatPill: React.FC<{
  icon: string
  label: string
  value: string
  pal: typeof MOOD_PALETTES['clear']
  delay?: number
}> = ({ icon, label, value, pal, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ scale: 1.03, y: -2 }}
    style={{
      background: pal.card,
      border: `1px solid ${pal.border}`,
      borderRadius: '16px',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      flex: '1 1 140px',
      cursor: 'default',
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.2)`,
      transition: 'box-shadow 0.3s ease',
    }}
  >
    <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{icon}</span>
    <div>
      <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: pal.subtext, margin: 0 }}>{label}</p>
      <p style={{ fontSize: '1.35rem', fontWeight: 700, color: pal.text, margin: '2px 0 0', letterSpacing: '-0.02em' }}>{value}</p>
    </div>
  </motion.div>
)

// Cinematic horizontal hourly scroll
const HourlyStrip: React.FC<{
  items: HourlyForecast[]
  pal: typeof MOOD_PALETTES['clear']
}> = ({ items, pal }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 30 })

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      style={{ marginBottom: '2rem' }}
    >
      <p style={{
        fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase',
        color: pal.subtext, marginBottom: '1rem',
      }}>
        24-Hour Forecast
      </p>
      <div
        ref={containerRef}
        style={{
          display: 'flex', gap: '0.75rem',
          overflowX: 'auto', paddingBottom: '0.75rem',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}
      >
        {items.map((item, i) => {
          const isNow = i === new Date().getHours()
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
              whileHover={{ scale: 1.06, y: -4 }}
              style={{
                flexShrink: 0,
                width: '72px',
                background: isNow
                  ? `linear-gradient(160deg, ${pal.accent}20, ${pal.card})`
                  : pal.card,
                border: `1px solid ${isNow ? pal.accent + '50' : pal.border}`,
                borderRadius: '14px',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                padding: '1rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: isNow
                  ? `0 0 20px ${pal.accent}25, inset 0 1px 0 rgba(255,255,255,0.08)`
                  : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                cursor: 'default',
                position: 'relative',
              }}
            >
              {isNow && (
                <span style={{
                  position: 'absolute', top: '-10px',
                  fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: pal.accent, background: `${pal.accent}25`,
                  border: `1px solid ${pal.accent}40`, borderRadius: '100px',
                  padding: '1px 7px',
                }}>
                  Now
                </span>
              )}
              <span style={{ fontSize: '0.65rem', color: pal.subtext, letterSpacing: '0.04em' }}>
                {item.hour}
              </span>
              <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: pal.text }}>
                {Math.round(item.temp)}°
              </span>
              <span style={{ fontSize: '0.6rem', color: pal.subtext }}>
                {Math.round(item.humidity)}%
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// Temperature sparkline — pure SVG mini chart
const TempSparkline: React.FC<{
  data: number[]
  pal: typeof MOOD_PALETTES['clear']
}> = ({ data, pal }) => {
  if (data.length < 2) return null
  const W = 320, H = 60
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * (H - 12) - 6,
  }))
  const d = pts.map((p, i) =>
    i === 0 ? `M${p.x},${p.y}` :
    `C${(pts[i-1].x + p.x)/2},${pts[i-1].y} ${(pts[i-1].x + p.x)/2},${p.y} ${p.x},${p.y}`
  ).join(' ')
  const area = `${d} L${W},${H} L0,${H} Z`

  return (
    <svg width={W} height={H} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pal.accent} stopOpacity="0.3" />
          <stop offset="100%" stopColor={pal.accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)" />
      <path d={d} fill="none" stroke={pal.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Current hour dot */}
      <circle
        cx={pts[new Date().getHours() % data.length]?.x ?? pts[0].x}
        cy={pts[new Date().getHours() % data.length]?.y ?? pts[0].y}
        r="4" fill={pal.accent}
        style={{ filter: `drop-shadow(0 0 6px ${pal.accent})` }}
      />
    </svg>
  )
}

// 7-day forecast row
const WeekForecast: React.FC<{
  days: DayForecast[]
  pal: typeof MOOD_PALETTES['clear']
}> = ({ days, pal }) => {
  const allHighs = days.map(d => d.high)
  const allLows = days.map(d => d.low)
  const absMin = Math.min(...allLows)
  const absMax = Math.max(...allHighs)
  const range = absMax - absMin || 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      <p style={{
        fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase',
        color: pal.subtext, marginBottom: '1rem',
      }}>
        7-Day Outlook
      </p>
      <div style={{
        background: pal.card,
        border: `1px solid ${pal.border}`,
        borderRadius: '20px',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>
        {days.map((day, i) => {
          const lowPct = ((day.low - absMin) / range) * 100
          const highPct = ((day.high - absMin) / range) * 100
          const barStart = lowPct
          const barWidth = highPct - lowPct
          const isToday = i === 0

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              whileHover={{ background: `${pal.accent}08` }}
              style={{
                display: 'grid',
                gridTemplateColumns: '52px 36px 1fr 28px 28px',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1.5rem',
                borderBottom: i < days.length - 1 ? `1px solid ${pal.border}` : 'none',
                cursor: 'default',
                transition: 'background 0.2s ease',
              }}
            >
              {/* Day */}
              <span style={{
                fontSize: '0.8rem', fontWeight: isToday ? 700 : 400,
                color: isToday ? pal.accent : pal.text,
                letterSpacing: '0.01em',
              }}>
                {isToday ? 'Today' : day.shortDay}
              </span>
              {/* Icon */}
              <span style={{ fontSize: '1.3rem', textAlign: 'center' }}>{day.icon}</span>
              {/* Range bar */}
              <div style={{ position: 'relative', height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
                <motion.div
                  initial={{ width: 0, left: `${barStart}%` }}
                  animate={{ width: `${barWidth}%`, left: `${barStart}%` }}
                  transition={{ duration: 0.8, delay: 0.15 * i, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: 'absolute', top: 0, height: '4px',
                    background: `linear-gradient(to right, ${pal.accent}80, ${pal.accent})`,
                    borderRadius: '2px',
                  }}
                />
              </div>
              {/* Low */}
              <span style={{ fontSize: '0.8rem', color: pal.subtext, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(day.low)}°
              </span>
              {/* High */}
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: pal.text, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(day.high)}°
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// Air quality / UV / detail metrics bar
const DetailMetrics: React.FC<{
  uvIndex: number
  visibility: number
  pressure: number
  humidity: number
  windSpeed: number
  windDir?: string
  pal: typeof MOOD_PALETTES['clear']
}> = ({ uvIndex, visibility, pressure, humidity, windSpeed, windDir, pal }) => {
  const metrics = [
    { icon: '☀️', label: 'UV Index', value: String(Math.round(uvIndex)), sub: uvIndex < 3 ? 'Low' : uvIndex < 6 ? 'Moderate' : uvIndex < 8 ? 'High' : 'Very High' },
    { icon: '👁️', label: 'Visibility', value: `${Math.round(visibility)}`, sub: 'km' },
    { icon: '🌡️', label: 'Pressure', value: `${Math.round(pressure)}`, sub: 'hPa' },
    { icon: '💧', label: 'Humidity', value: `${Math.round(humidity)}%`, sub: humidity < 40 ? 'Dry' : humidity < 70 ? 'Comfortable' : 'Humid' },
    { icon: '💨', label: 'Wind', value: `${Math.round(windSpeed)}`, sub: windDir ? `km/h ${windDir}` : 'km/h' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      style={{ marginBottom: '2rem' }}
    >
      <p style={{
        fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase',
        color: pal.subtext, marginBottom: '1rem',
      }}>
        Atmospheric Detail
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {metrics.map((m, i) => (
          <StatPill key={m.label} icon={m.icon} label={m.label} value={m.value} pal={pal} delay={0.08 * i} />
        ))}
      </div>
    </motion.div>
  )
}

// Sun arc visualization
const SunArc: React.FC<{
  sunrise?: string
  sunset?: string
  pal: typeof MOOD_PALETTES['clear']
}> = ({ sunrise = '06:12', sunset = '20:45', pal }) => {
  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const parseTime = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const riseMins = parseTime(sunrise)
  const setMins = parseTime(sunset)
  const dayLen = setMins - riseMins
  const progress = Math.max(0, Math.min(1, (nowMins - riseMins) / dayLen))

  const W = 280, H = 100, r = 90
  const cx = W / 2, cy = H + 10
  const startAngle = Math.PI
  const endAngle = 0
  const angle = startAngle + (endAngle - startAngle) * progress
  const sunX = cx + r * Math.cos(angle)
  const sunY = cy + r * Math.sin(angle)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.7 }}
      style={{
        background: pal.card,
        border: `1px solid ${pal.border}`,
        borderRadius: '20px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '1.5rem',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: pal.subtext, marginBottom: '1rem', margin: '0 0 1rem' }}>
        Sun Position
      </p>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
          {/* Arc track */}
          <path
            d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`}
            fill="none" stroke={`${pal.accent}20`} strokeWidth="2" strokeDasharray="4 4"
          />
          {/* Progress arc */}
          <path
            d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${sunX},${sunY}`}
            fill="none" stroke={pal.accent} strokeWidth="2" strokeLinecap="round"
          />
          {/* Horizon line */}
          <line x1={cx - r - 8} y1={cy} x2={cx + r + 8} y2={cy} stroke={`${pal.border}`} strokeWidth="1" />
          {/* Sun dot */}
          <motion.circle
            cx={sunX} cy={sunY} r="7" fill={pal.accent}
            animate={{ r: [7, 8, 7] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${pal.accent})` }}
          />
          {/* Labels */}
          <text x={cx - r} y={cy + 18} textAnchor="middle" fill={pal.subtext} fontSize="10" fontFamily="monospace">{sunrise}</text>
          <text x={cx + r} y={cy + 18} textAnchor="middle" fill={pal.subtext} fontSize="10" fontFamily="monospace">{sunset}</text>
        </svg>
      </div>
    </motion.div>
  )
}

// ======================================================
// PAGE: Weather (cinematic upgrade)
// ======================================================

export const Weather: React.FC = () => {
  const location = useContext(LocationContext)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([])
  const [weekForecast, setWeekForecast] = useState<DayForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [mood, setMood] = useState<WeatherMood>('clear')
  const [conditionMeta, setConditionMeta] = useState<{ icon: string; label: string }>({ icon: '🌤️', label: 'Partly Cloudy' })

  useEffect(() => {
    const loadWeather = async () => {
      if (!location?.latitude || !location?.longitude) return
      setLoading(true)
      try {
        const weather = await fetchWeatherData(location.latitude, location.longitude)
        setWeatherData(weather)

        const meta = parseCondition(weather.condition)
        setMood(meta.mood)
        setConditionMeta({ icon: meta.icon, label: meta.label })

        // Build rich hourly data
        const hourly: HourlyForecast[] = Array.from({ length: 24 }, (_, i) => {
          const cond = ['clear', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)]
          return {
            hour: `${String(i).padStart(2, '0')}:00`,
            temp: weather.temperature + Math.sin((i - 14) / 4) * 6 + Math.random() * 2 - 1,
            condition: cond,
            humidity: Math.max(20, Math.min(95, weather.humidity + Math.sin(i / 5) * 15 + Math.random() * 10 - 5)),
            windSpeed: weather.windSpeed + Math.random() * 10 - 5,
            icon: cond === 'rainy' ? '🌧️' : cond === 'cloudy' ? '☁️' : '☀️',
          }
        })
        setHourlyForecast(hourly)

        // Build 7-day forecast
        const today = new Date()
        const week: DayForecast[] = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today)
          d.setDate(today.getDate() + i)
          const dow = d.getDay()
          const conds: [string, string, string][] = [['☀️', 'Sunny', 'clear'], ['☁️', 'Cloudy', 'cloud'], ['🌧️', 'Rainy', 'rain'], ['🌩️', 'Stormy', 'storm'], ['🌤️', 'Partly Cloudy', 'clear']]
          const rc = conds[Math.floor(Math.random() * conds.length)]
          const base = weather.temperature + Math.random() * 6 - 3
          return {
            day: WEEK_DAYS[dow],
            shortDay: SHORT_DAYS[dow],
            high: Math.round(base + 3 + Math.random() * 3),
            low: Math.round(base - 3 - Math.random() * 3),
            condition: rc[1],
            icon: rc[0],
            humidity: Math.round(weather.humidity + Math.random() * 20 - 10),
            precipChance: Math.round(Math.random() * 80),
          }
        })
        setWeekForecast(week)
      } catch (error) {
        console.error('Error loading weather:', error)
      } finally {
        setLoading(false)
      }
    }
    loadWeather()
  }, [location?.latitude, location?.longitude])

  if (loading) return <LoadingScreen />
  if (!weatherData) {
    return (
      <div style={{ padding: '4rem 2rem', color: 'rgba(200,210,230,0.5)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
        NO WEATHER DATA AVAILABLE
      </div>
    )
  }

  const pal = MOOD_PALETTES[mood]
  const city = location?.city ?? 'Unknown Location'
  const sparkData = hourlyForecast.map(h => h.temp)

  return (
    <div style={{ position: 'relative', minHeight: '100vh', fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Cinematic background */}
      <AmbientBackground mood={mood} />

      {/* Weather particle effects */}
      {(mood === 'rainy' || mood === 'stormy') && <RainSystem intensity={mood === 'stormy' ? 50 : 30} />}
      {mood === 'snowy' && <SnowSystem />}
      {mood === 'stormy' && <LightningSystem />}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mood}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'relative', zIndex: 10,
            maxWidth: '900px',
            margin: '0 auto',
            padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2.5rem)',
          }}
        >
          {/* Temperature hero */}
          <TemperatureHero
            temp={weatherData.temperature}
            feelsLike={weatherData.feelsLike}
            condition={weatherData.condition}
            icon={conditionMeta.icon}
            label={conditionMeta.label}
            city={city}
            pal={pal}
          />

          {/* Sparkline */}
          {sparkData.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ marginBottom: '2.5rem', opacity: 0.8 }}
            >
              <TempSparkline data={sparkData} pal={pal} />
            </motion.div>
          )}

          {/* Hourly forecast strip */}
          {hourlyForecast.length > 0 && (
            <HourlyStrip items={hourlyForecast} pal={pal} />
          )}

          {/* Atmospheric detail metrics */}
          <DetailMetrics
            uvIndex={weatherData.uvIndex}
            visibility={weatherData.visibility}
            pressure={weatherData.pressure}
            humidity={weatherData.humidity}
            windSpeed={weatherData.windSpeed}
            pal={pal}
          />

          {/* Bottom two-column: 7-day + sun arc */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)',
            gap: '1.25rem',
            alignItems: 'start',
          }}>
            <WeekForecast days={weekForecast} pal={pal} />
            <SunArc pal={pal} />
          </div>

          {/* Last updated footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{
              marginTop: '3rem',
              fontSize: '0.6rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: pal.subtext,
              opacity: 0.5,
              fontFamily: '"Courier New", monospace',
            }}
          >
            Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            &nbsp;·&nbsp;{city}
            &nbsp;·&nbsp;{weatherData.condition}
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
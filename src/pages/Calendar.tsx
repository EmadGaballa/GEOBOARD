import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/Calendar.css'

// ======================================================
// TYPES
// ======================================================

type EventColor = 'cyan' | 'purple' | 'gold'
type FilterTab = 'all' | 'today' | 'week'

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  color: EventColor
}

interface NewEventState {
  title: string
  date: string
  time: string
  color: EventColor
}

// ======================================================
// ANIMATION VARIANTS
// ======================================================

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 0.68, 0, 1.2] },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: 'blur(4px)',
    transition: { duration: 0.25 },
  },
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
}

const cardVariant = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: 'blur(4px)',
    transition: { duration: 0.2 },
  },
}

// ======================================================
// HELPERS
// ======================================================

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DISPLAY_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}

function today(): string {
  return toDateKey(new Date())
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function fmtTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  return d
}

function endOfWeek(date: Date): Date {
  const d = startOfWeek(date)
  d.setDate(d.getDate() + 6)
  return d
}

// ======================================================
// SUB-COMPONENTS
// ======================================================

interface MiniCalendarProps {
  events: CalendarEvent[]
  selectedDate: string
  onSelectDate: (date: string) => void
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ events, selectedDate, onSelectDate }) => {
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    events.forEach(e => {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    })
    return map
  }, [events])

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

    const cells: { date: string; day: number; otherMonth: boolean }[] = []

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth - 1, daysInPrevMonth - i)
      cells.push({ date: toDateKey(d), day: daysInPrevMonth - i, otherMonth: true })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(viewYear, viewMonth, i)
      cells.push({ date: toDateKey(d), day: i, otherMonth: false })
    }
    const remaining = 42 - cells.length
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(viewYear, viewMonth + 1, i)
      cells.push({ date: toDateKey(d), day: i, otherMonth: true })
    }
    return cells
  }, [viewYear, viewMonth])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const todayKey = today()

  return (
    <div>
      {/* Month nav */}
      <div className="cal-month-nav">
        <div className="cal-month-label">
          <em>{MONTHS[viewMonth].slice(0, 3)}</em>{' '}
          {MONTHS[viewMonth].slice(3)} {viewYear}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <motion.button
            className="cal-nav-btn"
            onClick={prevMonth}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Previous month"
          >‹</motion.button>
          <motion.button
            className="cal-nav-btn"
            onClick={nextMonth}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Next month"
          >›</motion.button>
        </div>
      </div>

      {/* Day headers */}
      <div className="cal-day-headers">
        {DAY_NAMES.map(d => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="cal-days-grid">
        {days.map(({ date, day, otherMonth }) => {
          const evs = eventsByDate[date] || []
          const isToday = date === todayKey
          const isSelected = date === selectedDate
          return (
            <motion.button
              key={date}
              className={[
                'cal-day',
                otherMonth ? 'other-month' : '',
                isToday ? 'today' : '',
                isSelected ? 'selected' : '',
                evs.length ? 'has-events' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => !otherMonth && onSelectDate(date)}
              whileHover={!otherMonth ? { scale: 1.08 } : {}}
              whileTap={!otherMonth ? { scale: 0.94 } : {}}
            >
              <span>{day}</span>
              {evs.length > 0 && (
                <div className="cal-event-dots">
                  {evs.slice(0, 3).map((e, i) => (
                    <span key={i} className={`cal-event-dot ${e.color}`} />
                  ))}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ── Time ruler for selected day ──

interface TimeRulerProps {
  events: CalendarEvent[]
  selectedDate: string
  onTimeClick: (time: string) => void
}

const TimeRuler: React.FC<TimeRulerProps> = ({ events, selectedDate, onTimeClick }) => {
  const dayEvents = useMemo(
    () => events.filter(e => e.date === selectedDate),
    [events, selectedDate]
  )

  const eventsByHour = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = {}
    dayEvents.forEach(e => {
      const h = parseInt(e.time.split(':')[0])
      if (!map[h]) map[h] = []
      map[h].push(e)
    })
    return map
  }, [dayEvents])

  return (
    <div className="cal-time-ruler">
      <div className="cal-time-ruler-label">
        {selectedDate === today() ? 'Today' : fmtDate(selectedDate)}
      </div>
      {DISPLAY_HOURS.map(h => {
        const label = `${h % 12 || 12}${h >= 12 ? 'pm' : 'am'}`
        const evs = eventsByHour[h] || []
        return (
          <motion.div
            key={h}
            className="cal-time-slot"
            onClick={() => onTimeClick(`${String(h).padStart(2, '0')}:00`)}
            whileHover={{ paddingLeft: 8 }}
          >
            <span className="cal-time-slot-hour">{label}</span>
            <span className="cal-time-slot-line" />
            {evs.map(e => (
              <span key={e.id} className={`cal-time-event-chip ${e.color}`}>
                {e.title}
              </span>
            ))}
          </motion.div>
        )
      })}
    </div>
  )
}

// ======================================================
// MAIN PAGE
// ======================================================

export const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Team Meeting',
      date: today(),
      time: '10:00',
      color: 'cyan',
    },
    {
      id: '2',
      title: 'Project Review',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '14:00',
      color: 'purple',
    },
    {
      id: '3',
      title: 'Design Sprint',
      date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      time: '09:00',
      color: 'gold',
    },
  ])

  const [selectedDate, setSelectedDate] = useState<string>(today())
  const [showForm, setShowForm] = useState(false)
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [newEvent, setNewEvent] = useState<NewEventState>({
    title: '',
    date: today(),
    time: '09:00',
    color: 'cyan',
  })

  // Sync form date with selected date
  useEffect(() => {
    setNewEvent(prev => ({ ...prev, date: selectedDate }))
  }, [selectedDate])

  const canSubmit = useMemo(
    () => newEvent.title.trim() && newEvent.date && newEvent.time,
    [newEvent]
  )

  const handleAddEvent = useCallback(() => {
    if (!canSubmit) return
    const event: CalendarEvent = {
      id: crypto.randomUUID(),
      title: newEvent.title.trim(),
      date: newEvent.date,
      time: newEvent.time,
      color: newEvent.color,
    }
    setEvents(prev => [...prev, event])
    setNewEvent(prev => ({ ...prev, title: '', time: '09:00' }))
    setShowForm(false)
  }, [canSubmit, newEvent])

  const handleDeleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
  }, [])

  const handleTimeClick = useCallback((time: string) => {
    setNewEvent(prev => ({ ...prev, time }))
    setShowForm(true)
  }, [])

  // Filtered events
  const filteredEvents = useMemo(() => {
    const todayKey = today()
    const now = new Date()
    const weekStart = toDateKey(startOfWeek(now))
    const weekEnd = toDateKey(endOfWeek(now))

    const sorted = [...events].sort((a, b) =>
      `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
    )

    if (filterTab === 'today') return sorted.filter(e => e.date === todayKey)
    if (filterTab === 'week') return sorted.filter(e => e.date >= weekStart && e.date <= weekEnd)
    return sorted
  }, [events, filterTab])

  // ── Keyboard shortcut: N to open form ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'n' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        setShowForm(v => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      {/* Cinematic grain */}
      <div className="cal-grain" aria-hidden="true" />

      <div className="calendar-page">
        {/* ── HERO ── */}
        <motion.header
          className="cal-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.p
            className="cal-hero-eyebrow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Schedule — {new Date().getFullYear()}
          </motion.p>

          <motion.h1
            className="cal-hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <em>Cal</em>endar
          </motion.h1>

          <motion.p
            className="cal-hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            {events.length} {events.length === 1 ? 'event' : 'events'} scheduled ·{' '}
            press <kbd style={{ background: 'rgba(200,169,110,0.1)', padding: '0 4px', borderRadius: 2, fontSize: 9, border: '1px solid rgba(200,169,110,0.2)' }}>N</kbd>{' '}
            to add
          </motion.p>

          <motion.div
            className="cal-hero-actions"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {showForm ? (
                <motion.button
                  key="cancel"
                  className="btn-ghost"
                  onClick={() => setShowForm(false)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              ) : (
                <motion.button
                  key="add"
                  className="btn-gold"
                  onClick={() => setShowForm(true)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileTap={{ scale: 0.95 }}
                >
                  + Add Event
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.header>

        {/* ── MAIN GRID ── */}
        <div className="calendar-grid">

          {/* ── LEFT: Mini calendar + time ruler ── */}
          <motion.aside
            className="calendar-widget-wrapper"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp}>
              <MiniCalendar
                events={events}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <TimeRuler
                events={events}
                selectedDate={selectedDate}
                onTimeClick={handleTimeClick}
              />
            </motion.div>
          </motion.aside>

          {/* ── TOP RIGHT: Add event form ── */}
          <AnimatePresence>
            {showForm && (
              <motion.section
                className="calendar-form-wrapper"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <h2 className="cal-form-title">
                  New <em>Event</em>
                </h2>

                <div className="cal-form-grid">
                  {/* Title */}
                  <div className="cal-input-group">
                    <label className="cal-input-label">Title</label>
                    <input
                      className="cal-input"
                      placeholder="Event name…"
                      value={newEvent.title}
                      onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleAddEvent()}
                      autoFocus
                    />
                  </div>

                  {/* Date */}
                  <div className="cal-input-group">
                    <label className="cal-input-label">Date</label>
                    <input
                      type="date"
                      className="cal-input"
                      value={newEvent.date}
                      onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))}
                    />
                  </div>

                  {/* Time */}
                  <div className="cal-input-group">
                    <label className="cal-input-label">Time</label>
                    <input
                      type="time"
                      className="cal-input"
                      value={newEvent.time}
                      onChange={e => setNewEvent(p => ({ ...p, time: e.target.value }))}
                    />
                  </div>

                  {/* Color + Submit */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="cal-input-label">Color</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div className="cal-color-picker">
                        {(['cyan', 'purple', 'gold'] as EventColor[]).map(c => (
                          <motion.button
                            key={c}
                            className={`cal-color-dot ${c} ${newEvent.color === c ? 'active' : ''}`}
                            onClick={() => setNewEvent(p => ({ ...p, color: c }))}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label={`Color ${c}`}
                          />
                        ))}
                      </div>
                      <motion.button
                        className="btn-gold"
                        onClick={handleAddEvent}
                        whileTap={{ scale: 0.95 }}
                        style={{ opacity: canSubmit ? 1 : 0.4, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
                      >
                        Create
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ── BOTTOM RIGHT: Events list ── */}
          <motion.section
            className="calendar-events-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="cal-events-header">
              <h2 className="cal-events-title">Events</h2>
              <span className="cal-events-count">{filteredEvents.length}</span>
              <div className="cal-events-filter">
                {(['all', 'today', 'week'] as FilterTab[]).map(tab => (
                  <motion.button
                    key={tab}
                    className={`cal-filter-pill ${filterTab === tab ? 'active' : ''}`}
                    onClick={() => setFilterTab(tab)}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tab}
                  </motion.button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredEvents.length === 0 ? (
                <motion.div
                  key="empty"
                  className="cal-empty"
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  <div className="cal-empty-icon">◈</div>
                  <p className="cal-empty-text">No events in this range</p>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  className="event-grid"
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                >
                  {filteredEvents.map(event => (
                    <motion.div
                      key={event.id}
                      layout
                      variants={cardVariant}
                      exit="exit"
                      className={`event-card color-${event.color}`}
                      onClick={() => setSelectedDate(event.date)}
                    >
                      <div className="event-card-header">
                        <div>
                          <div className="event-card-title">{event.title}</div>
                          <div className="event-card-meta">
                            <span className="event-card-date">{fmtDate(event.date)}</span>
                            <span className="event-card-time">{fmtTime(event.time)}</span>
                          </div>
                        </div>
                        <motion.button
                          className="event-delete-btn"
                          onClick={e => { e.stopPropagation(); handleDeleteEvent(event.id) }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`Delete ${event.title}`}
                        >
                          ✕
                        </motion.button>
                      </div>

                      <div className="event-progress-bar">
                        <motion.div
                          className="event-progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

        </div>
      </div>
    </>
  )
}

export default Calendar
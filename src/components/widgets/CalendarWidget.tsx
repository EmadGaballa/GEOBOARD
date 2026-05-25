import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { CalendarWidgetProps, CalendarEvent } from '../../../services/types'
import '../../styles/CalendarWidget.css'

// ======================================================
// COMPONENT: CalendarWidget
// ======================================================

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  events,
  onAddEvent,
  onDeleteEvent,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const getDaysInMonth = (date: Date): number =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  const getFirstDayOfMonth = (date: Date): number =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const formatDateString = (day: number): string =>
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const monthDays = Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => i + 1)
  const firstDay = getFirstDayOfMonth(currentDate)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const monthName = currentDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  const getEventsForDate = (day: number): CalendarEvent[] =>
    events.filter(e => e.date === formatDateString(day))

  const isToday = (day: number): boolean => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="calendar-card"
      role="region"
      aria-label="Calendar widget"
    >
      {/* Header */}
      <div className="calendar-header">
        <h3 className="calendar-title">{monthName}</h3>

        <div className="calendar-nav">
          <button className="icon-btn" onClick={() =>
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
          }>
            <ChevronLeft size={20} />
          </button>

          <button className="icon-btn" onClick={() =>
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
          }>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Days grid */}
      <div className="calendar-grid">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}

        {emptyDays.map(i => (
          <div key={i} className="calendar-empty" />
        ))}

        {monthDays.map(day => {
          const dayEvents = getEventsForDate(day)
          const isTodayDate = isToday(day)

          return (
            <motion.button
              key={day}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDate(formatDateString(day))}
              className={[
                'calendar-day',
                isTodayDate ? 'today' : '',
                dayEvents.length > 0 ? 'has-events' : ''
              ].join(' ')}
            >
              {day}

              {dayEvents.length > 0 && (
                <div className="event-dots">
                  {dayEvents.map((_, i) => (
                    <span key={i} className="dot" />
                  ))}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Events */}
      <div className="calendar-events">
        <h4>Upcoming Events</h4>

        {events.length === 0 ? (
          <p className="no-events">No events scheduled</p>
        ) : (
          events.slice(0, 5).map(event => (
            <div key={event.id} className="event-item">
              <div>
                <p className="event-title">{event.title}</p>
                <p className="event-meta">{event.date} • {event.time}</p>
              </div>

              <button
                className="delete-btn"
                onClick={() => onDeleteEvent(event.id)}
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}

export default CalendarWidget
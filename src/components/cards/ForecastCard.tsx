import React from 'react'
import { motion } from 'framer-motion'
import { ForecastCardProps } from '../../../services/types'
import '../../styles/ForecastCard.css'

// ======================================================
// COMPONENT: ForecastCard
// ======================================================

const cinematicEase = [0.16, 1, 0.3, 1]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.5, ease: cinematicEase } 
  },
}

export const ForecastCard: React.FC<ForecastCardProps> = ({
  days,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="forecast-card">
        <h3 className="forecast-title">7-Day Forecast</h3>
        <div className="forecast-list">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="forecast-item loading-shimmer">
              <div className="forecast-left">
                <div className="skeleton-icon" />
                <div className="skeleton-text-group">
                  <div className="skeleton-text-main" />
                  <div className="skeleton-text-sub" />
                </div>
              </div>
              <div className="skeleton-right" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: cinematicEase }}
      className="forecast-card"
    >
      <div className="forecast-header">
        <h3 className="forecast-title">7-Day Forecast</h3>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="forecast-list"
      >
        {days.map((day, index) => (
          <motion.div
            key={`${day.day}-${index}`}
            variants={itemVariants}
            whileHover={{ x: 6, backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
            className="forecast-item"
          >
            <div className="forecast-left">
              <span className="forecast-icon">{day.icon}</span>

              <div className="forecast-info">
                <p className="forecast-day">{day.day}</p>
                <p className="forecast-condition">{day.condition}</p>
              </div>
            </div>

            <div className="forecast-right">
              <p className="forecast-temp">{Math.round(day.temp)}°</p>
              <div className="forecast-humidity-badge">
                💧 {day.humidity}%
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default ForecastCard
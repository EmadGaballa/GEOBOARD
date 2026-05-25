import React from 'react'
import { motion } from 'framer-motion'
import { WeatherCardProps } from '../../../services/types'

import '../../styles/WeatherCard.css'

// ======================================================
// COMPONENT: WeatherCard
// ======================================================

export const WeatherCard: React.FC<WeatherCardProps> = ({
  temperature,
  condition,
  icon,
  humidity,
  windSpeed,
  feelsLike,
  pressure,
  uvIndex,
}) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="weather-card"
    >

      {/* HEADER */}
      <div className="weather-header">

        <div>

          <p className="weather-label">
            Current Weather
          </p>

          <h3 className="weather-temperature">
            {Math.round(temperature)}°C
          </h3>

          <p className="weather-condition">
            {condition}
          </p>

        </div>

        {/* ICON */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="weather-icon"
        >
          {icon}
        </motion.div>

      </div>

      {/* PRIMARY STATS */}
      <div className="weather-stats-grid">

        <div className="weather-stat">
          <p className="weather-stat-label">
            Feels Like
          </p>

          <p className="weather-stat-value weather-cyan">
            {Math.round(feelsLike)}°
          </p>
        </div>

        <div className="weather-stat">
          <p className="weather-stat-label">
            Humidity
          </p>

          <p className="weather-stat-value weather-purple">
            {humidity}%
          </p>
        </div>

        <div className="weather-stat">
          <p className="weather-stat-label">
            Wind
          </p>

          <p className="weather-stat-value weather-pink">
            {windSpeed} m/s
          </p>
        </div>

      </div>

      {/* SECONDARY STATS */}
      {(pressure !== undefined || uvIndex !== undefined) && (
        <div className="weather-secondary-grid">

          {pressure !== undefined && (
            <div className="weather-stat">
              <p className="weather-stat-label">
                Pressure
              </p>

              <p className="weather-small-value weather-green">
                {Math.round(pressure)} hPa
              </p>
            </div>
          )}

          {uvIndex !== undefined && (
            <div className="weather-stat">
              <p className="weather-stat-label">
                UV Index
              </p>

              <p className="weather-small-value weather-orange">
                {Math.round(uvIndex)}
              </p>
            </div>
          )}

        </div>
      )}

    </motion.div>
  )
}

export default WeatherCard
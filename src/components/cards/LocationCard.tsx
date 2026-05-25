import React from 'react'
import { motion } from 'framer-motion'
import { LocationCardProps } from '../../../services/types'

import '../../styles/LocationCard.css'

// ======================================================
// COMPONENT: LocationCard (SAFE VERSION)
// ======================================================

export const LocationCard: React.FC<LocationCardProps> = ({
  city,
  country,
  timezone,
  coordinates,
}) => {
  // ================= SAFE GUARD =================
  const lat = coordinates?.lat
  const lon = coordinates?.lon

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="location-card"
    >
      {/* HEADER */}
      <div className="location-header">
        <div className="location-info">
          <p className="location-label">Current Location</p>

          <h3 className="location-city">
            {city ?? 'Unknown City'}
          </h3>

          <p className="location-country">
            {country ?? 'Unknown Country'}
          </p>
        </div>

        <motion.span
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="location-icon"
        >
          📍
        </motion.span>
      </div>

      {/* DETAILS */}
      <div className="location-details">

        <div className="location-row">
          <span className="location-row-label">Timezone</span>
          <span className="location-timezone">
            {timezone ?? 'N/A'}
          </span>
        </div>

        <div className="location-row">
          <span className="location-row-label">Latitude</span>
          <span className="location-lat">
            {typeof lat === 'number' ? lat.toFixed(4) : '—'}
          </span>
        </div>

        <div className="location-row">
          <span className="location-row-label">Longitude</span>
          <span className="location-lon">
            {typeof lon === 'number' ? lon.toFixed(4) : '—'}
          </span>
        </div>

      </div>
    </motion.div>
  )
}

export default LocationCard
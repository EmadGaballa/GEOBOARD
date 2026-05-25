import React from 'react'
import { motion } from 'framer-motion'
import { LoadingScreenProps } from '../../../services/types'
import '../../styles/LoadingScreen.css'

// ======================================================
// COMPONENT: LoadingScreen
// ======================================================

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading your dashboard...',
}) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="loading-screen"
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      {/* Background Glow */}
      <div className="loading-background">
        <div className="loading-orb loading-orb-cyan" />
        <div className="loading-orb loading-orb-purple" />
        <div className="loading-grid" />
      </div>

      {/* Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="loading-spinner"
      >
        <div className="spinner-inner" />
      </motion.div>

      {/* Text */}
      <div className="loading-content">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="loading-title"
        >
          GeoBoard
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="loading-message"
        >
          {message}
        </motion.p>
      </div>

      {/* Progress Indicator */}
      <div
        className="loading-progress"
        aria-hidden="true"
      >
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="loading-progress-bar"
        />
      </div>
    </motion.div>
  )
}

export default LoadingScreen
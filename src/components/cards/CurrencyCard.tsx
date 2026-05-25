import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CurrencyCardProps } from '../../services/types'
import { formatTime } from '../../services/utils/format'
import '../../styles/CurrencyCard.css'

// ======================================================
// COMPONENT: CurrencyCard
// ======================================================

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val)
}

// Cinematic easing curve
const cinematicEase = [0.16, 1, 0.3, 1]

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: cinematicEase,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: cinematicEase } 
  },
}

export const CurrencyCard: React.FC<CurrencyCardProps> = ({
  fromCurrency,
  toCurrency,
  rate,
  amount,
  result,
  flag,
  timestamp, // Recommended to pass this via props from your data fetcher
}) => {
  // Fallback for timestamp if not provided by the API
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    if (!timestamp) {
      setCurrentTime(new Date().toISOString())
    }
  }, [timestamp])

  const displayTime = timestamp || currentTime

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: cinematicEase }}
      className="currency-card"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="currency-card-header">
        <div className="currency-card-info">
          <p className="currency-subtitle">
            <span className="currency-tag">{fromCurrency}</span>
            <span className="currency-arrow">→</span>
            <span className="currency-tag">{toCurrency}</span>
          </p>
          <p className="currency-rate">{rate.toFixed(4)}</p>
        </div>

        {/* Animated Icon Container */}
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="currency-flag"
        >
          {flag || '💱'}
        </motion.div>
      </motion.div>

      {/* Conversion Display */}
      <motion.div variants={itemVariants} className="currency-conversion-box">
        <p className="currency-label">CONVERSION</p>

        <div className="currency-conversion-text">
          <span className="currency-amount">{formatCurrency(amount)}</span>
          <span className="currency-equals">=</span>
          <span className="currency-result">{formatCurrency(result)}</span>
        </div>
      </motion.div>

      {/* Exchange Rate Info */}
      <motion.div variants={itemVariants} className="currency-footer">
        <span className="currency-footer-text">
          1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
        </span>

        {displayTime && (
          <span className="currency-time">
            {formatTime(displayTime)}
          </span>
        )}
      </motion.div>
    </motion.div>
  )
}

export default CurrencyCard
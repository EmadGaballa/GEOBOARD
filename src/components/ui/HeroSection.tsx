import React from 'react'
import { motion } from 'framer-motion'
import { HeroSectionProps } from '../../../services/types'
import '../../styles/HeroSection.css'

// ======================================================
// COMPONENT: HeroSection
// ======================================================

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="hero-section"
    >
      {/* Background Gradient */}
      <div className="hero-background" />

      {/* Glow Effects */}
      <div className="hero-glow hero-glow-cyan" />
      <div className="hero-glow hero-glow-purple" />

      {/* Content */}
      <div className="hero-content">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="hero-title"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="hero-subtitle"
        >
          {subtitle}
        </motion.p>

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="hero-children"
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}

export default HeroSection
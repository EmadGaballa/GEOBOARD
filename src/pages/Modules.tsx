import React from 'react'
import { motion } from 'framer-motion'
import { HeroSection } from '../components'

// ======================================================
// TYPES
// ======================================================

interface ModuleItem {
  title: string
  description: string
  icon: string
  status: string
  color: 'cyan' | 'purple' | 'pink' | 'green'
}

// ======================================================
// STATIC DATA
// ======================================================

const modules: ModuleItem[] = [
  {
    title: 'Maps',
    description: 'Interactive maps and real-time spatial intelligence',
    icon: '🗺️',
    status: 'Coming Soon',
    color: 'cyan',
  },
  {
    title: 'Traffic',
    description: 'Live mobility + congestion prediction system',
    icon: '🚗',
    status: 'Coming Soon',
    color: 'purple',
  },
  {
    title: 'Stocks',
    description: 'Market telemetry and financial analytics',
    icon: '📈',
    status: 'Coming Soon',
    color: 'pink',
  },
  {
    title: 'Events',
    description: 'Global event discovery engine',
    icon: '🎉',
    status: 'Coming Soon',
    color: 'green',
  },
  {
    title: 'Air Quality',
    description: 'Environmental monitoring network',
    icon: '💨',
    status: 'Coming Soon',
    color: 'cyan',
  },
  {
    title: 'Restaurants',
    description: 'Location-based discovery system',
    icon: '🍕',
    status: 'Coming Soon',
    color: 'purple',
  },
]

// ======================================================
// ANIMATION VARIANTS
// ======================================================

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 90, damping: 16 },
  },
}

// ======================================================
// PAGE
// ======================================================

export const Modules: React.FC = () => {
  return (
    <div className="modules-page">

      <HeroSection
        title="Expansion Modules"
        subtitle="A modular intelligence system under active development"
      />

      {/* GRID */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="modules-grid"
      >
        {modules.map((module) => (
          <motion.div
            key={module.title}
            variants={item}
            whileHover={{ y: -10, scale: 1.02 }}
            className={`module-card ${module.color}`}
          >
            <div className="module-glow" />

            <div className="module-icon">{module.icon}</div>

            <h3 className="module-title">{module.title}</h3>

            <p className="module-desc">{module.description}</p>

            <div className="module-footer">
              <span className="module-status">{module.status}</span>
              <span className="module-arrow">→</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ROADMAP */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="roadmap"
      >
        <h2>Development Roadmap</h2>

        {[
          {
            quarter: 'Q2 2026',
            features: ['Maps', 'Traffic', 'Events'],
          },
          {
            quarter: 'Q3 2026',
            features: ['Stocks', 'Analytics', 'Charts'],
          },
          {
            quarter: 'Q4 2026',
            features: ['AI Engine', 'Social Layer', 'Mobile App'],
          },
        ].map((r) => (
          <div key={r.quarter} className="roadmap-item">
            <div className="roadmap-dot" />
            <div>
              <h4>{r.quarter}</h4>
              <div className="roadmap-tags">
                {r.features.map(f => (
                  <span key={f}>{f}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

    </div>
  )
}
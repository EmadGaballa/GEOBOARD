import React from 'react'
import { motion } from 'framer-motion'
import { DashboardGridProps } from '../../../services/types'
import '../../styles/DashboardGrid.css'

// ======================================================
// COMPONENT: DashboardGrid
// ======================================================

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  columns = 3,
}) => {
  const getGridClass = () => {
    switch (columns) {
      case 1:
        return 'dashboard-grid cols-1'
      case 2:
        return 'dashboard-grid cols-2'
      case 3:
        return 'dashboard-grid cols-3'
      case 4:
        return 'dashboard-grid cols-4'
      case 5:
        return 'dashboard-grid cols-5'
      case 6:
        return 'dashboard-grid cols-6'
      default:
        return 'dashboard-grid cols-3'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={getGridClass()}
      role="region"
      aria-label="Dashboard grid"
    >
      {children}
    </motion.div>
  )
}

export default DashboardGrid
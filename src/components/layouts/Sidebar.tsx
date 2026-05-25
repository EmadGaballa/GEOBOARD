import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'

import {
  Home,
  Cloud,
  Newspaper,
  DollarSign,
  Calendar,
  Box,
  LogOut,
  Settings,
  X,
} from 'lucide-react'

import { SidebarProps, NavLink } from '../../services/types'

import '../../styles/Sidebar.css'

// ======================================================
// NAV LINKS
// ======================================================

const navLinks: NavLink[] = [
  { path: '/', label: 'Dashboard', icon: <Home size={20} /> },
  { path: '/weather', label: 'Weather', icon: <Cloud size={20} /> },
  { path: '/news', label: 'News', icon: <Newspaper size={20} /> },
  { path: '/currency', label: 'Currency', icon: <DollarSign size={20} /> },
  { path: '/calendar', label: 'Calendar', icon: <Calendar size={20} /> },
  { path: '/modules', label: 'Modules', icon: <Box size={20} /> },
]

// ======================================================
// COMPONENT: Sidebar
// ======================================================

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  setOpen
}) => {

  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigation = (path: string) => {
    navigate(path)
    setOpen(false)
  }

  return (
    <>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>

        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="sidebar-overlay"
            aria-hidden="true"
          />
        )}

      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : -300 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
        className="sidebar"
        role="navigation"
        aria-label="Main navigation"
      >

        <div className="sidebar-content">

          {/* LOGO */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="sidebar-logo"
          >

            <h1 className="sidebar-logo-title">
              GEO
            </h1>

            <p className="sidebar-logo-subtitle">
              Smart Location Dashboard
            </p>

          </motion.div>

          {/* NAVIGATION */}
          <nav className="sidebar-nav">

            {navLinks.map((link, index) => {

              const isActive =
                location.pathname === link.path

              return (
                <motion.button
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => handleNavigation(link.path)}
                  className={
                    isActive
                      ? 'sidebar-link sidebar-link-active'
                      : 'sidebar-link'
                  }
                  aria-current={
                    isActive ? 'page' : undefined
                  }
                >

                  <span
                    className={
                      isActive
                        ? 'sidebar-link-icon active'
                        : 'sidebar-link-icon'
                    }
                  >
                    {link.icon}
                  </span>

                  <span className="sidebar-link-text">
                    {link.label}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="sidebar-active-indicator"
                      aria-hidden="true"
                    />
                  )}

                </motion.button>
              )
            })}

          </nav>

          {/* DIVIDER */}
          <div className="sidebar-divider" />

          {/* BOTTOM ACTIONS */}
          <div className="sidebar-actions">

            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="sidebar-action-button"
            >

              <Settings size={20} />

              <span>
                Settings
              </span>

            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="sidebar-action-button logout"
            >

              <LogOut size={20} />

              <span>
                Logout
              </span>

            </motion.button>

          </div>

        </div>

      </motion.aside>

      {/* MOBILE CLOSE BUTTON */}
      <AnimatePresence>

        {open && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="sidebar-close-button"
            aria-label="Close menu"
          >
            <X size={24} />
          </motion.button>
        )}

      </AnimatePresence>

    </>
  )
}

export default Sidebar
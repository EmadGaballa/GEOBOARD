import React from 'react'
import { motion } from 'framer-motion'

import '../../styles/AnimatedBackground.css'

// ======================================================
// COMPONENT: AnimatedBackground
// ======================================================

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="animated-background">

      {/* Gradient Layer 1 */}
      <motion.div
        className="animated-gradient-layer"
        animate={{
          background: [
            `
            radial-gradient(circle at 20% 50%, rgba(176, 0, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(0, 240, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 0%, rgba(255, 0, 110, 0.1) 0%, transparent 50%)
            `,

            `
            radial-gradient(circle at 80% 20%, rgba(176, 0, 255, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(0, 240, 255, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 0, 110, 0.15) 0%, transparent 50%)
            `,

            `
            radial-gradient(circle at 20% 50%, rgba(176, 0, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(0, 240, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 0%, rgba(255, 0, 110, 0.1) 0%, transparent 50%)
            `,
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Gradient Layer 2 */}
      <motion.div
        className="animated-overlay-layer"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Blob 1 */}
      <motion.div
        className="animated-blob animated-blob-cyan"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Blob 2 */}
      <motion.div
        className="animated-blob animated-blob-purple"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Blob 3 */}
      <motion.div
        className="animated-blob animated-blob-pink"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

    </div>
  )
}

export default AnimatedBackground
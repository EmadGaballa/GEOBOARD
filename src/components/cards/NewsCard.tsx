import React from 'react'
import { motion } from 'framer-motion'

import '../../styles/NewsCard.css'

// ======================================================
// TYPES
// ======================================================

interface NewsArticle {
  id: string
  title: string
  description: string
  image: string
  category: string
  source: string
  publishedAt: string
  url: string
}

interface NewsCardProps {
  article: NewsArticle
  onRead: (article: NewsArticle) => void
}

// ======================================================
// COMPONENT: NewsCard
// ======================================================

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onRead
}) => {

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const published = new Date(date)

    const diffMs = now.getTime() - published.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`

    return `${Math.floor(diffMins / 1440)}d ago`
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={() => onRead(article)}
      className="news-card"
    >

      {/* IMAGE */}
      <div className="news-image-wrapper">

        <img
          src={
            article.image ||
            'https://via.placeholder.com/400x300?text=No+Image'
          }
          alt={article.title}
          className="news-image"
        />

        <div className="news-image-overlay" />

        <div className="news-badges">
          <span className="news-category-badge">
            {article.category}
          </span>
        </div>

      </div>

      {/* TITLE */}
      <h3 className="news-title">
        {article.title}
      </h3>

      {/* DESCRIPTION */}
      <p className="news-description">
        {article.description}
      </p>

      {/* FOOTER */}
      <div className="news-footer">

        <span className="news-source">
          {article.source}
        </span>

        <span className="news-time">
          {getTimeAgo(article.publishedAt)}
        </span>

      </div>

    </motion.div>
  )
}

export default NewsCard
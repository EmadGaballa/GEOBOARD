import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { fetchNewsData, NewsArticle } from '../services/api/news'

import '../styles/News.css'

// ======================================================
// TYPES
// ======================================================

interface TickerItem {
  text: string
}

// ======================================================
// CONSTANTS
// ======================================================

const CATEGORIES = [
  'technology',
  'business',
  'science',
  'health',
  'sports',
  'entertainment',
]

// Ticker headlines — duplicated for seamless loop
const TICKER_ITEMS: TickerItem[] = [
  { text: 'Global markets steady amid rate uncertainty' },
  { text: 'Tech sector leads Q2 earnings beats' },
  { text: 'Climate summit reaches landmark accord' },
  { text: 'Central banks signal coordinated pivot' },
  { text: 'AI regulation framework proposed in Brussels' },
  { text: 'Space agency confirms new mission timeline' },
]

// ======================================================
// ANIMATION VARIANTS
// ======================================================

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] },
  }),
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.25 } },
}

const modalVariants = {
  hidden:  { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.25 } },
}

// ======================================================
// SUB-COMPONENTS
// ======================================================

// Live ticker banner
const NewsTicker: React.FC = () => {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS] // duplicate for seamless loop
  return (
    <div className="news-ticker-bar">
      <span className="news-ticker-label">LIVE</span>
      <div className="news-ticker-track">
        <div className="news-ticker-content">
          {items.map((item, i) => (
            <span key={i}>{item.text}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Tag pill
const Tag: React.FC<{ variant?: 'category' | 'breaking' | 'source'; children: React.ReactNode }> = ({
  variant = 'category',
  children,
}) => (
  <span className={`news-tag news-tag--${variant}`}>{children}</span>
)

// Featured (hero) article card
const FeaturedCard: React.FC<{
  article: NewsArticle
  onRead: (a: NewsArticle) => void
}> = ({ article, onRead }) => (
  <motion.div
    className="news-featured"
    onClick={() => onRead(article)}
    whileHover="hover"
    initial="rest"
  >
    {article.image && (
      <img
        src={article.image}
        alt={article.title}
        className="news-featured-img"
        loading="lazy"
      />
    )}
    <div className="news-featured-overlay" />
    <div className="news-featured-body">
      <div className="news-featured-eyebrow">
        {article.isBreaking && <Tag variant="breaking">Breaking</Tag>}
        <Tag variant="category">{article.category}</Tag>
        <Tag variant="source">{article.source}</Tag>
      </div>
      <h2 className="news-featured-title">{article.title}</h2>
      <p className="news-featured-desc">{article.description}</p>
      <div className="news-featured-meta">
        <span>{article.publishedAt}</span>
        <button className="news-read-btn" onClick={e => { e.stopPropagation(); onRead(article) }}>
          Read Signal <span className="arrow">→</span>
        </button>
      </div>
    </div>
  </motion.div>
)

// Standard article card
const ArticleCard: React.FC<{
  article: NewsArticle
  onRead: (a: NewsArticle) => void
  index: number
}> = ({ article, onRead, index }) => (
  <motion.div
    className="news-card"
    custom={index}
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    exit="exit"
    onClick={() => onRead(article)}
  >
    {article.image && (
      <div className="news-card-img-wrap">
        <img
          src={article.image}
          alt={article.title}
          className="news-card-img"
          loading="lazy"
        />
      </div>
    )}
    <div className="news-card-eyebrow">
      {article.isBreaking && <Tag variant="breaking">Breaking</Tag>}
      <Tag variant="category">{article.category}</Tag>
    </div>
    <h3 className="news-card-title">{article.title}</h3>
    <p className="news-card-desc">{article.description}</p>
    <div className="news-card-footer">
      <span>{article.source} · {article.publishedAt}</span>
      <span className="news-card-footer-read">Read →</span>
    </div>
  </motion.div>
)

// List-style article row
const ArticleListItem: React.FC<{
  article: NewsArticle
  index: number
  onRead: (a: NewsArticle) => void
}> = ({ article, index, onRead }) => (
  <motion.div
    className="news-list-item"
    custom={index}
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    exit="exit"
    onClick={() => onRead(article)}
  >
    <span className="news-list-num">
      {String(index + 1).padStart(2, '0')}
    </span>
    <div className="news-list-content">
      <h4 className="news-list-title">{article.title}</h4>
      <p className="news-list-meta">
        {article.source} · {article.publishedAt} · {article.category}
      </p>
    </div>
  </motion.div>
)

// Article detail modal
const ArticleModal: React.FC<{
  article: NewsArticle | null
  onClose: () => void
}> = ({ article, onClose }) => {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <AnimatePresence>
      {article && (
        <motion.div
          className="news-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            className="news-modal-panel"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header bar */}
            <div className="news-modal-header">
              <span className="news-modal-header-label">
                Intelligence Report · {article.category}
              </span>
              <button className="news-modal-close" onClick={onClose}>
                ✕ Close
              </button>
            </div>

            {/* Image */}
            {article.image && (
              <img
                src={article.image}
                alt={article.title}
                className="news-modal-img"
              />
            )}

            {/* Body */}
            <div className="news-modal-body">
              <div className="news-modal-eyebrow">
                {article.isBreaking && <Tag variant="breaking">Breaking</Tag>}
                <Tag variant="category">{article.category}</Tag>
                <Tag variant="source">{article.source}</Tag>
              </div>

              <h2 className="news-modal-title">{article.title}</h2>
              <p className="news-modal-desc">{article.description}</p>

              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-modal-link"
              >
                Open Full Report <span>→</span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ======================================================
// PAGE: News
// ======================================================

export const News: React.FC = () => {
  const [newsData, setNewsData]               = useState<NewsArticle[]>([])
  const [searchQuery, setSearchQuery]         = useState('')
  const [selectedCategory, setSelectedCategory] = useState('technology')
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)
  const [loading, setLoading]                 = useState(true)

  // ── Load data ────────────────────────────────────────────
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true)
      try {
        const news = await fetchNewsData(selectedCategory)
        setNewsData(news)
      } catch (err) {
        console.error('News fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadNews()
  }, [selectedCategory])

  // ── Filter engine ─────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return newsData.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    )
  }, [newsData, searchQuery])

  const featured  = filtered[0]           // hero slot
  const secondary = filtered.slice(1, 3)  // right-column cards
  const listed    = filtered.slice(3)     // list section

  const handleRead = useCallback((a: NewsArticle) => setSelectedArticle(a), [])
  const handleClose = useCallback(() => setSelectedArticle(null), [])

  // ── Masthead date ─────────────────────────────────────────
  const dateline = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).toUpperCase()

  // ── Loading state ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="news-page">
        <div className="news-inner">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ padding: '6rem 0', textAlign: 'center', fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.25em', color: 'rgba(160,165,180,0.4)', textTransform: 'uppercase' }}
          >
            Fetching Intelligence Feed...
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="news-page">
      <div className="news-inner">

        {/* ── Masthead ──────────────────────────────────────── */}
        <motion.header
          className="news-masthead"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="news-masthead-top">
            <h1 className="news-logotype">
              Intel<span>.</span>Feed
            </h1>
            <span className="news-dateline">{dateline}</span>
          </div>
          <NewsTicker />
        </motion.header>

        {/* ── Search ────────────────────────────────────────── */}
        <motion.div
          className="news-search-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <input
            type="text"
            className="news-search-input"
            placeholder="Search intelligence..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <span className="news-search-icon">⌕</span>
          <div className="news-search-line" />
        </motion.div>

        {/* ── Category filters ──────────────────────────────── */}
        <motion.div
          className="news-filters"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat}
              className={`news-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>

        {/* ── Content ───────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <div className="news-layout">
              <div className="news-empty">No intelligence signals found</div>
            </div>
          ) : (
            <motion.div
              key={selectedCategory + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* Main grid: featured + secondary */}
              <div className="news-layout">
                {featured && (
                  <FeaturedCard article={featured} onRead={handleRead} />
                )}

                <AnimatePresence mode="popLayout">
                  {secondary.map((article, i) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      index={i}
                      onRead={handleRead}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* List section */}
              {listed.length > 0 && (
                <div className="news-list">
                  <AnimatePresence mode="popLayout">
                    {listed.map((article, i) => (
                      <ArticleListItem
                        key={article.id}
                        article={article}
                        index={i}
                        onRead={handleRead}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── Article modal ─────────────────────────────────── */}
      <ArticleModal article={selectedArticle} onClose={handleClose} />
    </div>
  )
}
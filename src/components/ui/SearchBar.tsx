import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { SearchBarProps } from '../../../services/types'
import '../../styles/SearchBar.css'

// ======================================================
// COMPONENT: SearchBar
// ======================================================

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  value,
  onChange,
}) => {
  const [query, setQuery] = useState(value || '')
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = useCallback(
    (inputValue: string) => {
      setQuery(inputValue)
      onSearch(inputValue)
      onChange?.(inputValue)
    },
    [onSearch, onChange]
  )

  const handleClear = useCallback(() => {
    setQuery('')
    onSearch('')
    onChange?.('')
  }, [onSearch, onChange])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="searchBar"
    >
      <div className={`searchInputWrapper ${isFocused ? 'focused' : ''}`}>
        
        {/* Icon */}
        <div className="searchIcon">
          <Search size={18} />
        </div>

        {/* Input */}
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="searchInput"
          aria-label={placeholder}
        />

        {/* Clear */}
        {query && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleClear}
            className="clearButton"
            aria-label="Clear search"
          >
            <X size={18} />
          </motion.button>
        )}
      </div>

      {/* Focus line */}
      {isFocused && (
        <motion.div
          layoutId="searchFocus"
          className="focusLine"
          aria-hidden="true"
        />
      )}
    </motion.div>
  )
}

export default SearchBar
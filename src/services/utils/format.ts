// ======================================================
// UTILITY FUNCTIONS: Date & Time Formatting
// ======================================================

export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export const formatDateTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export const formatTimeAgo = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  const diffWeeks = Math.floor(diffMs / 604800000)
  const diffMonths = Math.floor(diffMs / 2592000000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffWeeks < 4) return `${diffWeeks}w ago`
  if (diffMonths < 12) return `${diffMonths}mo ago`

  return formatDate(date)
}

export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals)
}

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`
}

export const formatTemperature = (celsius: number, fahrenheit: boolean = false): string => {
  if (fahrenheit) {
    const f = (celsius * 9) / 5 + 32
    return `${Math.round(f)}°F`
  }
  return `${Math.round(celsius)}°C`
}

export const formatDistance = (meters: number, kilometers: boolean = true): string => {
  if (kilometers) {
    const km = meters / 1000
    return km >= 1 ? `${km.toFixed(1)}km` : `${meters}m`
  }
  return `${meters}m`
}

export const formatSpeed = (metersPerSecond: number, kmh: boolean = true): string => {
  if (kmh) {
    const kmSpeed = metersPerSecond * 3.6
    return `${kmSpeed.toFixed(1)}km/h`
  }
  return `${metersPerSecond.toFixed(1)}m/s`
}

export const formatHumidity = (percentage: number): string => {
  return `${Math.round(percentage)}%`
}

export const formatPressure = (hpa: number, inHg: boolean = false): string => {
  if (inHg) {
    const inHgValue = hpa * 0.02953
    return `${inHgValue.toFixed(2)}"Hg`
  }
  return `${hpa.toFixed(0)} hPa`
}

export const formatUVIndex = (index: number): string => {
  if (index < 2) return 'Low'
  if (index < 5) return 'Moderate'
  if (index < 7) return 'High'
  if (index < 10) return 'Very High'
  return 'Extreme'
}

export const formatVisibility = (meters: number): string => {
  const km = meters / 1000
  if (km >= 10) return 'Excellent'
  if (km >= 5) return 'Good'
  if (km >= 1) return 'Moderate'
  return 'Poor'
}

// ======================================================
// TIME RANGE FORMATTING
// ======================================================

export const formatDateRange = (startDate: Date, endDate: Date): string => {
  const sameDay = startDate.toDateString() === endDate.toDateString()
  const sameMonth = startDate.getMonth() === endDate.getMonth()

  if (sameDay) {
    return formatDate(startDate)
  }

  if (sameMonth) {
    return `${startDate.getDate()}-${endDate.getDate()} ${startDate.toLocaleString('en-US', {
      month: 'long',
    })} ${startDate.getFullYear()}`
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

// ======================================================
// TRUNCATION & SANITIZATION
// ======================================================

export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

export const truncateLines = (text: string, maxLines: number = 3): string => {
  const lines = text.split('\n')
  if (lines.length <= maxLines) return text
  return `${lines.slice(0, maxLines).join('\n')}...`
}

export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

// ======================================================
// CASE TRANSFORMATIONS
// ======================================================

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, char => char.toUpperCase())
}

export const snakeCaseToTitle = (str: string): string => {
  return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
}

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
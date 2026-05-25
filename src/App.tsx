import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import {
  Navbar,
  Sidebar,
  AnimatedBackground,
} from './components'

import {
  Home,
  Weather,
  News,
  Currency,
  Calendar,
  Modules,
} from './pages'

import {
  saveLocation,
  loadLocation,
} from './utils/locationStorage'

// =========================
// TYPES
// =========================

interface GeolocationState {
  latitude: number
  longitude: number
  city: string
  country: string
  timezone: string
  loading: boolean
  error: string | null
  timestamp?: number
}

interface UserLocation {
  latitude: number
  longitude: number
  city: string
  country: string
  timezone: string
}

// =========================
// CONTEXT
// =========================

export const LocationContext =
  React.createContext<UserLocation>({
    latitude: 0,
    longitude: 0,
    city: 'Unknown',
    country: 'Unknown',
    timezone: 'UTC',
  })

// =========================
// CONSTANTS
// =========================

const LOCATION_CACHE_MAX_AGE =
  1000 * 60 * 60 * 6 // 6 hours

// =========================
// APP
// =========================

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false)

  const [geolocation, setGeolocation] =
    useState<GeolocationState>({
      latitude: 0,
      longitude: 0,
      city: 'Loading...',
      country: 'Loading...',
      timezone:
        Intl.DateTimeFormat().resolvedOptions()
          .timeZone,
      loading: true,
      error: null,
    })

  // =========================
  // LOCATION ENGINE
  // =========================

  useEffect(() => {
    let isMounted = true

    const timezone =
      Intl.DateTimeFormat().resolvedOptions()
        .timeZone

    // =========================
    // STEP 1: LOAD CACHE
    // =========================

    const cachedLocation = loadLocation()

    if (cachedLocation) {
      setGeolocation({
        latitude: cachedLocation.latitude,
        longitude: cachedLocation.longitude,
        city: cachedLocation.city,
        country: cachedLocation.country,
        timezone:
          cachedLocation.timezone || timezone,
        loading: false,
        error: null,
        timestamp: cachedLocation.timestamp,
      })
    }

    // =========================
    // STEP 2: CHECK CACHE AGE
    // =========================

    const shouldRefreshLocation =
      !cachedLocation ||
      !cachedLocation.timestamp ||
      Date.now() - cachedLocation.timestamp >
        LOCATION_CACHE_MAX_AGE

    // =========================
    // STEP 3: SILENT REFRESH
    // =========================

    if (!shouldRefreshLocation) {
      return
    }

    // =========================
    // GEOLOCATION UNSUPPORTED
    // =========================

    if (!navigator.geolocation) {
      setGeolocation((prev) => ({
        ...prev,
        loading: false,
        error: 'Geolocation not supported',
      }))

      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } =
          position.coords

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )

          const data = await response.json()

          const newLocation = {
            latitude,
            longitude,
            city:
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              'Unknown',
            country:
              data.address?.country || 'Unknown',
            timezone,
            timestamp: Date.now(),
          }

          // SAVE CACHE
          saveLocation(newLocation)

          if (!isMounted) return

          // UPDATE STATE
          setGeolocation({
            ...newLocation,
            loading: false,
            error: null,
          })
        } catch (error) {
          console.error(
            'Reverse geocoding failed:',
            error
          )

          const fallbackLocation = {
            latitude,
            longitude,
            city: 'Detected Location',
            country: 'Unknown',
            timezone,
            timestamp: Date.now(),
          }

          saveLocation(fallbackLocation)

          if (!isMounted) return

          setGeolocation({
            ...fallbackLocation,
            loading: false,
            error: null,
          })
        }
      },

      (error) => {
        console.error(
          'Geolocation permission denied:',
          error
        )

        // ONLY use fallback if no cache exists
        if (cachedLocation) return

        if (!isMounted) return

        const fallbackLocation = {
          latitude: 40.7128,
          longitude: -74.006,
          city: 'New York',
          country: 'United States',
          timezone: 'America/New_York',
          timestamp: Date.now(),
        }

        saveLocation(fallbackLocation)

        setGeolocation({
          ...fallbackLocation,
          loading: false,
          error: 'Using fallback location',
        })
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000 * 60 * 60,
      }
    )

    return () => {
      isMounted = false
    }
  }, [])

  // =========================
  // CONTEXT VALUE
  // =========================

  const locationValue: UserLocation = {
    latitude: geolocation.latitude,
    longitude: geolocation.longitude,
    city: geolocation.city,
    country: geolocation.country,
    timezone: geolocation.timezone,
  }

  // =========================
  // RENDER
  // =========================

  return (
    <Router>
      <LocationContext.Provider
        value={locationValue}
      >
        <div className="app-shell">
          <AnimatedBackground />

          <Sidebar
            open={sidebarOpen}
            setOpen={setSidebarOpen}
          />

          <div className="app-main">
            <Navbar
              onMenuClick={() =>
                setSidebarOpen(!sidebarOpen)
              }
            />

            <main className="app-content">
              {geolocation.loading ? (
                <div className="loading-screen">
                  <div className="spinner" />

                  <p>
                    Detecting your location...
                  </p>
                </div>
              ) : (
                <Routes>
                  <Route
                    path="/"
                    element={<Home />}
                  />

                  <Route
                    path="/weather"
                    element={<Weather />}
                  />

                  <Route
                    path="/news"
                    element={<News />}
                  />

                  <Route
                    path="/currency"
                    element={<Currency />}
                  />

                </Routes>
              )}
            </main>
          </div>
        </div>
      </LocationContext.Provider>
    </Router>
  )
}

export default App
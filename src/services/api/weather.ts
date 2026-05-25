import { apiClient } from '../apiClient'
import { WeatherData, ForecastDay, HourlyForecast } from '../types'

// ======================================================
// API SERVICE: WEATHER
// ======================================================

/**
 * Fetch current weather data and forecast
 */
export const fetchWeatherData = async (
  latitude: number,
  longitude: number
): Promise<WeatherData> => {
  try {
    // Using Open-Meteo API (free, no API key required)
    const response = await apiClient.get<any>(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl,visibility&daily=sunrise,sunset,uv_index_max&timezone=auto`
    )

    const current = response.current
    const daily = response.daily

    // Weather code to condition mapping (WMO Weather codes)
    const weatherConditions: { [key: number]: string } = {
      0: 'Clear',
      1: 'Partly Cloudy',
      2: 'Cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Foggy',
      51: 'Light Drizzle',
      53: 'Moderate Drizzle',
      55: 'Dense Drizzle',
      61: 'Slight Rain',
      63: 'Moderate Rain',
      65: 'Heavy Rain',
      71: 'Slight Snow',
      73: 'Moderate Snow',
      75: 'Heavy Snow',
      80: 'Slight Rain Showers',
      81: 'Moderate Rain Showers',
      82: 'Violent Rain Showers',
      85: 'Slight Snow Showers',
      86: 'Heavy Snow Showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with Hail',
      99: 'Thunderstorm with Hail',
    }

    return {
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      condition: weatherConditions[current.weather_code] || 'Unknown',
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      pressure: current.pressure_msl,
      visibility: Math.round((current.visibility || 10000) / 1000),
      uvIndex: Math.round(daily.uv_index_max[0] || 0),
      sunrise: daily.sunrise[0],
      sunset: daily.sunset[0],
      timezone: response.timezone,
    }
  } catch (error) {
    console.error('Error fetching weather:', error)
    // Return mock data on error
    return getMockWeatherData()
  }
}

/**
 * Fetch 7-day forecast
 */
export const fetch7DayForecast = async (
  latitude: number,
  longitude: number
): Promise<ForecastDay[]> => {
  try {
    const response = await apiClient.get<any>(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code,relative_humidity_2m_max,precipitation_sum,wind_speed_10m_max&timezone=auto`
    )

    const daily = response.daily
    const weatherConditions = getWeatherConditions()

    const forecastDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    return daily.time.slice(0, 7).map((date: string, index: number) => ({
      day: forecastDays[(new Date(date).getDay() + 6) % 7],
      date,
      temp: Math.round((daily.temperature_2m_max[index] + daily.temperature_2m_min[index]) / 2),
      tempMin: Math.round(daily.temperature_2m_min[index]),
      tempMax: Math.round(daily.temperature_2m_max[index]),
      condition: weatherConditions[daily.weather_code[index]] || 'Unknown',
      icon: getWeatherIcon(weatherConditions[daily.weather_code[index]] || 'Unknown'),
      humidity: daily.relative_humidity_2m_max[index],
      windSpeed: Math.round(daily.wind_speed_10m_max[index]),
      precipitation: Math.round(daily.precipitation_sum[index] * 10) / 10,
    }))
  } catch (error) {
    console.error('Error fetching 7-day forecast:', error)
    return getMock7DayForecast()
  }
}

/**
 * Fetch hourly forecast
 */
export const fetchHourlyForecast = async (
  latitude: number,
  longitude: number,
  hours: number = 24
): Promise<HourlyForecast[]> => {
  try {
    const response = await apiClient.get<any>(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
    )

    const hourly = response.hourly
    const weatherConditions = getWeatherConditions()

    return hourly.time.slice(0, hours).map((time: string, index: number) => ({
      hour: new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(hourly.temperature_2m[index]),
      condition: weatherConditions[hourly.weather_code[index]] || 'Unknown',
      humidity: hourly.relative_humidity_2m[index],
      windSpeed: Math.round(hourly.wind_speed_10m[index]),
    }))
  } catch (error) {
    console.error('Error fetching hourly forecast:', error)
    return getMockHourlyForecast()
  }
}

// ======================================================
// HELPER FUNCTIONS
// ======================================================

const getWeatherConditions = (): { [key: number]: string } => ({
  0: 'Clear',
  1: 'Partly Cloudy',
  2: 'Cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  71: 'Slight Snow',
  73: 'Moderate Snow',
  75: 'Heavy Snow',
  80: 'Slight Rain Showers',
  81: 'Moderate Rain Showers',
  82: 'Violent Rain Showers',
  85: 'Slight Snow Showers',
  86: 'Heavy Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Hail',
  99: 'Thunderstorm with Hail',
})

export const getWeatherIcon = (condition: string): string => {
  const lowerCondition = condition.toLowerCase()
  if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) return '🌧️'
  if (lowerCondition.includes('cloud')) return '☁️'
  if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) return '☀️'
  if (lowerCondition.includes('snow')) return '❄️'
  if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) return '⛈️'
  if (lowerCondition.includes('fog')) return '🌫️'
  if (lowerCondition.includes('partly')) return '⛅'
  return '🌤️'
}

const getMockWeatherData = (): WeatherData => ({
  temperature: 22,
  feelsLike: 21,
  condition: 'Partly Cloudy',
  humidity: 65,
  windSpeed: 12,
  pressure: 1013,
  visibility: 10,
  uvIndex: 4,
  sunrise: '06:30',
  sunset: '18:45',
  timezone: 'UTC',
})

const getMock7DayForecast = (): ForecastDay[] => [
  {
    day: 'Monday',
    temp: 22,
    tempMin: 18,
    tempMax: 25,
    condition: 'Sunny',
    icon: '☀️',
    humidity: 50,
    windSpeed: 10,
  },
  {
    day: 'Tuesday',
    temp: 20,
    tempMin: 16,
    tempMax: 24,
    condition: 'Cloudy',
    icon: '☁️',
    humidity: 60,
    windSpeed: 12,
  },
  {
    day: 'Wednesday',
    temp: 18,
    tempMin: 15,
    tempMax: 21,
    condition: 'Rainy',
    icon: '🌧️',
    humidity: 80,
    windSpeed: 15,
  },
  {
    day: 'Thursday',
    temp: 19,
    tempMin: 16,
    tempMax: 22,
    condition: 'Partly Cloudy',
    icon: '⛅',
    humidity: 65,
    windSpeed: 11,
  },
  {
    day: 'Friday',
    temp: 23,
    tempMin: 20,
    tempMax: 26,
    condition: 'Sunny',
    icon: '☀️',
    humidity: 45,
    windSpeed: 8,
  },
  {
    day: 'Saturday',
    temp: 24,
    tempMin: 21,
    tempMax: 27,
    condition: 'Clear',
    icon: '🌟',
    humidity: 40,
    windSpeed: 7,
  },
  {
    day: 'Sunday',
    temp: 21,
    tempMin: 18,
    tempMax: 24,
    condition: 'Cloudy',
    icon: '☁️',
    humidity: 55,
    windSpeed: 9,
  },
]

const getMockHourlyForecast = (): HourlyForecast[] => {
  const now = new Date()
  return Array.from({ length: 24 }, (_, i) => {
    const time = new Date(now.getTime() + i * 3600000)
    return {
      hour: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      temp: 20 + Math.sin(i / 4) * 5,
      condition: ['Clear', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)],
      humidity: 50 + Math.random() * 30,
      windSpeed: 8 + Math.random() * 12,
    }
  })
}
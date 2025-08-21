'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/lib/components/ui/card'
import { Button } from '@/lib/components/ui/button'
import { IWeatherSettings } from '@/types'
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Thermometer } from 'lucide-react'

interface IWeatherWidgetProps {
  settings: IWeatherSettings
  isEditMode?: boolean
  onRemove?: () => void
  onSettingsChange?: (settings: IWeatherSettings) => void
}

interface IWeatherData {
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
  }
  name: string
  sys: {
    country: string
  }
  wind: {
    speed: number
    deg: number
  }
}

const getWeatherIcon = (weatherMain: string, size: 'sm' | 'lg' = 'lg') => {
  const iconSize = size === 'lg' ? 'w-16 h-16' : 'w-6 h-6'
  const iconClass = `${iconSize} text-blue-500`
  
  switch (weatherMain.toLowerCase()) {
    case 'clear':
      return <Sun className={`${iconClass} text-yellow-500`} />
    case 'clouds':
      return <Cloud className={iconClass} />
    case 'rain':
      return <CloudRain className={`${iconClass} text-blue-600`} />
    case 'snow':
      return <CloudSnow className={`${iconClass} text-blue-300`} />
    default:
      return <Cloud className={iconClass} />
  }
}

export default function WeatherWidget({ 
  settings, 
  isEditMode, 
  onRemove, 
  onSettingsChange 
}: IWeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<IWeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWeatherData()
  }, [settings.city, settings.unit])

  const fetchWeatherData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(settings.city)}&units=${settings.unit}`
      )
      
      const result = await response.json()
      
      if (result.success) {
        setWeatherData(result.data)
      } else {
        setError(result.error || '날씨 정보를 가져올 수 없습니다.')
      }
    } catch (err) {
      setError('날씨 정보를 가져오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getTemperatureUnit = () => {
    switch (settings.unit) {
      case 'imperial': return '°F'
      case 'kelvin': return 'K'
      default: return '°C'
    }
  }

  const formatTemperature = (temp: number) => {
    return Math.round(temp)
  }

  if (loading) {
    return (
      <Card className="p-6 h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 h-full flex flex-col items-center justify-center">
        <Cloud className="w-12 h-12 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{error}</p>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={fetchWeatherData}
          className="mt-2"
        >
          다시 시도
        </Button>
        {isEditMode && onRemove && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={onRemove}
          >
            ×
          </Button>
        )}
      </Card>
    )
  }

  if (!weatherData) {
    return (
      <Card className="p-6 h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">날씨 정보 없음</p>
      </Card>
    )
  }

  return (
    <Card 
      className={`p-6 h-full relative ${isEditMode ? 'border-2 border-dashed border-blue-300' : ''}`}
      onMouseDown={(e) => {
        // 편집 모드에서 위젯 내부 클릭 시 드래그 이벤트 차단
        if (isEditMode) {
          e.stopPropagation()
        }
      }}
    >
      <div className="flex flex-col h-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{weatherData.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {weatherData.weather[0].description}
            </p>
          </div>
          {getWeatherIcon(weatherData.weather[0].main)}
        </div>

        {/* 온도 */}
        <div className="flex items-center justify-center mb-4">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {formatTemperature(weatherData.main.temp)}{getTemperatureUnit()}
          </span>
        </div>

        {/* 상세 정보 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-orange-500" />
            <span className="text-gray-700 dark:text-gray-300">체감 {formatTemperature(weatherData.main.feels_like)}{getTemperatureUnit()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-gray-700 dark:text-gray-300">습도 {weatherData.main.humidity}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">바람 {weatherData.wind.speed}m/s</span>
          </div>
          <div className="flex items-center space-x-2">
            <Cloud className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">{weatherData.main.pressure}hPa</span>
          </div>
        </div>
      </div>

      {isEditMode && onRemove && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2"
          onClick={onRemove}
        >
          ×
        </Button>
      )}
    </Card>
  )
}
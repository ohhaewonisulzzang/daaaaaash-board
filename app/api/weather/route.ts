import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city') || 'Seoul'
    const units = searchParams.get('units') || 'metric'
    
    // OpenWeatherMap API 키가 없으면 목업 데이터 반환
    const apiKey = process.env.OPENWEATHER_API_KEY
    
    if (!apiKey) {
      // 목업 날씨 데이터
      const mockWeatherData = {
        weather: [{
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }],
        main: {
          temp: 22,
          feels_like: 24,
          humidity: 65,
          pressure: 1013
        },
        name: city,
        sys: {
          country: 'KR'
        },
        wind: {
          speed: 3.2,
          deg: 180
        }
      }
      
      return NextResponse.json({
        success: true,
        data: mockWeatherData,
        message: 'Mock weather data (API key not configured)'
      })
    }

    // 실제 API 호출
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}&lang=kr`
    )

    if (!weatherResponse.ok) {
      throw new Error('날씨 정보를 가져올 수 없습니다.')
    }

    const weatherData = await weatherResponse.json()

    return NextResponse.json({
      success: true,
      data: weatherData
    })

  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: '날씨 정보를 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// 5일 예보 API
export async function POST(request: NextRequest) {
  try {
    const { city, units = 'metric' } = await request.json()
    
    const apiKey = process.env.OPENWEATHER_API_KEY
    
    if (!apiKey) {
      // 목업 5일 예보 데이터
      const mockForecastData = {
        list: Array.from({ length: 5 }, (_, i) => ({
          dt: Date.now() / 1000 + (i * 24 * 60 * 60),
          main: {
            temp: 20 + Math.random() * 10,
            humidity: 60 + Math.random() * 20
          },
          weather: [{
            main: i % 2 === 0 ? 'Clear' : 'Clouds',
            description: i % 2 === 0 ? 'clear sky' : 'few clouds',
            icon: i % 2 === 0 ? '01d' : '02d'
          }]
        })),
        city: {
          name: city || 'Seoul',
          country: 'KR'
        }
      }
      
      return NextResponse.json({
        success: true,
        data: mockForecastData,
        message: 'Mock forecast data (API key not configured)'
      })
    }

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}&lang=kr`
    )

    if (!forecastResponse.ok) {
      throw new Error('날씨 예보를 가져올 수 없습니다.')
    }

    const forecastData = await forecastResponse.json()

    return NextResponse.json({
      success: true,
      data: forecastData
    })

  } catch (error) {
    console.error('Weather forecast API error:', error)
    return NextResponse.json(
      { error: '날씨 예보를 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
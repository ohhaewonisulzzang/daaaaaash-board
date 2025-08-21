'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/lib/components/ui/card'
import { Button } from '@/lib/components/ui/button'
import { ICalendarSettings } from '@/types'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface ICalendarWidgetProps {
  settings: ICalendarSettings
  isEditMode?: boolean
  onRemove?: () => void
}

export default function CalendarWidget({ 
  settings, 
  isEditMode, 
  onRemove 
}: ICalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ]
  
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  
  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // 현재 월의 첫 번째 날과 마지막 날
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  
  // 캘린더 그리드를 위한 빈 셀 수 계산
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()
  
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }
  
  const goToToday = () => {
    setCurrentDate(new Date())
  }
  
  // 날짜 그리드 생성
  const renderDateGrid = () => {
    const days = []
    
    // 이전 달의 빈 칸들
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(
        <div key={`empty-${i}`} className="w-8 h-8 text-xs"></div>
      )
    }
    
    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const isToday = date.toDateString() === today.toDateString()
      
      days.push(
        <div
          key={day}
          className={`w-8 h-8 text-xs flex items-center justify-center rounded cursor-pointer transition-colors ${
            isToday 
              ? 'bg-blue-500 text-white font-bold' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          onClick={() => {
            // TODO: 날짜 클릭 이벤트 처리
          }}
        >
          {day}
        </div>
      )
    }
    
    return days
  }
  
  return (
    <Card 
      className={`p-4 relative ${isEditMode ? 'border-2 border-dashed border-blue-300' : ''}`}
      onMouseDown={(e) => {
        // 편집 모드에서 위젯 내부 클릭 시 드래그 이벤트 차단
        if (isEditMode) {
          e.stopPropagation()
        }
      }}
    >
      <div className="flex flex-col h-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-sm">캘린더</h3>
          </div>
        </div>
        
        {/* 월/년 네비게이션 */}
        <div className="flex items-center justify-between mb-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={goToPrevMonth}
            className="h-6 w-6 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-sm font-medium">
            {currentYear}년 {monthNames[currentMonth]}
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={goToNextMonth}
            className="h-6 w-6 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((dayName, index) => (
            <div key={dayName} className={`text-xs text-center font-medium ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
            }`}>
              {dayName}
            </div>
          ))}
        </div>
        
        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {renderDateGrid()}
        </div>
        
        {/* 오늘로 이동 버튼 */}
        <div className="mt-3 pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={goToToday}
            className="w-full h-6 text-xs"
          >
            오늘로 이동
          </Button>
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
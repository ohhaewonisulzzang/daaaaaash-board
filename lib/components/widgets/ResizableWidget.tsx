'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { IWidget } from '@/types'

interface IResizableWidgetProps {
  id: string
  widget: IWidget
  isEditMode: boolean
  children: React.ReactNode
  onResize?: (widgetId: string, width: number, height: number) => void
}

type ResizeDirection = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

export default function ResizableWidget({ 
  id, 
  widget, 
  isEditMode, 
  children,
  onResize
}: IResizableWidgetProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [currentWidth, setCurrentWidth] = useState(widget.width)
  const [currentHeight, setCurrentHeight] = useState(widget.height)
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentWidth(widget.width)
    setCurrentHeight(widget.height)
  }, [widget.width, widget.height])

  const getNewDimensions = useCallback((
    direction: ResizeDirection,
    deltaX: number,
    deltaY: number,
    startWidth: number,
    startHeight: number
  ) => {
    // 그리드 단위로 계산 (민감도 조정)
    const gridSize = 80 // 조금 더 민감하게 조정
    const sensitivity = 0.8 // 민감도 계수
    
    const adjustedDeltaX = deltaX * sensitivity
    const adjustedDeltaY = deltaY * sensitivity
    
    const gridDeltaX = Math.round(adjustedDeltaX / gridSize)
    const gridDeltaY = Math.round(adjustedDeltaY / gridSize)

    let newWidth = startWidth
    let newHeight = startHeight

    // 방향별로 크기 조정
    switch (direction) {
      case 'e': // 동쪽 (오른쪽)
        newWidth = startWidth + gridDeltaX
        break
      case 'w': // 서쪽 (왼쪽)
        newWidth = startWidth - gridDeltaX
        break
      case 's': // 남쪽 (아래쪽)
        newHeight = startHeight + gridDeltaY
        break
      case 'n': // 북쪽 (위쪽)
        newHeight = startHeight - gridDeltaY
        break
      case 'se': // 남동쪽 (오른쪽 아래)
        newWidth = startWidth + gridDeltaX
        newHeight = startHeight + gridDeltaY
        break
      case 'sw': // 남서쪽 (왼쪽 아래)
        newWidth = startWidth - gridDeltaX
        newHeight = startHeight + gridDeltaY
        break
      case 'ne': // 북동쪽 (오른쪽 위)
        newWidth = startWidth + gridDeltaX
        newHeight = startHeight - gridDeltaY
        break
      case 'nw': // 북서쪽 (왼쪽 위)
        newWidth = startWidth - gridDeltaX
        newHeight = startHeight - gridDeltaY
        break
    }

    // 최소/최대 크기 제한 (더 넓은 범위)
    newWidth = Math.max(1, Math.min(8, newWidth))
    newHeight = Math.max(1, Math.min(6, newHeight))

    return { width: newWidth, height: newHeight }
  }, [])

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: ResizeDirection) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsResizing(true)
    setResizeDirection(direction)
    setIsDragging(true)
    
    // 전체 문서에 resizing 클래스 추가 (커서 및 selection 제어)
    document.body.classList.add('resizing')
    document.body.style.cursor = getCursorClass(direction).replace('cursor-', '') + '-resize'
    
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = currentWidth
    const startHeight = currentHeight
    
    // 실시간 피드백을 위한 임시 크기 저장
    let tempWidth = startWidth
    let tempHeight = startHeight

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      
      const { width, height } = getNewDimensions(direction, deltaX, deltaY, startWidth, startHeight)
      
      tempWidth = width
      tempHeight = height
      
      setCurrentWidth(width)
      setCurrentHeight(height)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setResizeDirection(null)
      setIsDragging(false)
      
      // 전체 문서 클래스 및 커서 제거
      document.body.classList.remove('resizing')
      document.body.style.cursor = ''
      
      // 크기가 실제로 변경된 경우에만 콜백 호출
      if (onResize && (tempWidth !== widget.width || tempHeight !== widget.height)) {
        onResize(widget.id, tempWidth, tempHeight)
      }
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [currentWidth, currentHeight, widget.width, widget.height, widget.id, onResize, getNewDimensions])

  const getCursorClass = (direction: ResizeDirection) => {
    const cursors = {
      'n': 'cursor-n-resize',
      'ne': 'cursor-ne-resize',
      'e': 'cursor-e-resize',
      'se': 'cursor-se-resize',
      's': 'cursor-s-resize',
      'sw': 'cursor-sw-resize',
      'w': 'cursor-w-resize',
      'nw': 'cursor-nw-resize'
    }
    return cursors[direction]
  }

  const style = {
    gridColumn: `span ${currentWidth}`,
    gridRow: `span ${currentHeight}`,
  }

  return (
    <div
      ref={containerRef}
      style={style}
      className={`relative group ${isResizing ? 'z-50 select-none' : ''} ${isDragging ? 'pointer-events-none' : ''}`}
    >
      {children}
      
      {/* 편집 모드일 때 선택 윤곽선 */}
      {isEditMode && (
        <div className={`absolute inset-0 border-2 border-dashed transition-all duration-200 pointer-events-none ${
          isResizing 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-transparent group-hover:border-blue-400 group-hover:bg-blue-400/5'
        }`} />
      )}
      
      {/* 리사이즈 핸들들 - 이미지 편집기 스타일 */}
      {isEditMode && (
        <>
          {/* 코너 핸들들 (8x8 사각형) */}
          {/* 왼쪽 위 */}
          <div
            className={`absolute -top-1 -left-1 w-3 h-3 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 ${getCursorClass('nw')} opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-all duration-200 z-20 hover:scale-110 hover:shadow-md rounded-sm`}
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          {/* 오른쪽 위 */}
          <div
            className={`absolute -top-1 -right-1 w-3 h-3 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 ${getCursorClass('ne')} opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-all duration-200 z-20 hover:scale-110 hover:shadow-md rounded-sm`}
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          {/* 왼쪽 아래 */}
          <div
            className={`absolute -bottom-1 -left-1 w-3 h-3 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 ${getCursorClass('sw')} opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-all duration-200 z-20 hover:scale-110 hover:shadow-md rounded-sm`}
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          {/* 오른쪽 아래 */}
          <div
            className={`absolute -bottom-1 -right-1 w-3 h-3 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 ${getCursorClass('se')} opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-all duration-200 z-20 hover:scale-110 hover:shadow-md rounded-sm`}
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          
          {/* 모서리 핸들들 (중앙 부분) */}
          {/* 상단 */}
          <div
            className={`absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 ${getCursorClass('n')} opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-all duration-200 z-20 hover:scale-110 hover:shadow-md rounded-sm`}
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          {/* 하단 */}
          <div
            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 ${getCursorClass('s')} opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-all duration-200 z-20 hover:scale-110 hover:shadow-md rounded-sm`}
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          {/* 좌측 */}
          <div
            className={`absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 ${getCursorClass('w')} opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-all duration-200 z-20 hover:scale-110 hover:shadow-md rounded-sm`}
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          {/* 우측 */}
          <div
            className={`absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 ${getCursorClass('e')} opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-all duration-200 z-20 hover:scale-110 hover:shadow-md rounded-sm`}
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
        </>
      )}
      
      {/* 리사이징 중일 때 크기 및 방향 표시 */}
      {isResizing && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-1 rounded-full shadow-lg z-50 font-medium">
          {currentWidth} × {currentHeight}
          {resizeDirection && (
            <span className="ml-2 text-blue-400 dark:text-blue-600">
              {resizeDirection.toUpperCase()}
            </span>
          )}
        </div>
      )}
      
      {/* 호버 시 크기 힌트 */}
      {isEditMode && !isResizing && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-700 dark:bg-gray-300 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          {currentWidth} × {currentHeight}
        </div>
      )}
    </div>
  )
}
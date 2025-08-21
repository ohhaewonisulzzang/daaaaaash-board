'use client'

import { useState, useRef, useEffect } from 'react'
import { IWidget } from '@/types'

interface IResizableWidgetProps {
  id: string
  widget: IWidget
  isEditMode: boolean
  children: React.ReactNode
  onResize?: (widgetId: string, width: number, height: number) => void
}

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
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [startSize, setStartSize] = useState({ width: 0, height: 0 })
  const resizeHandleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentWidth(widget.width)
    setCurrentHeight(widget.height)
  }, [widget.width, widget.height])

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsResizing(true)
    setStartPos({ x: e.clientX, y: e.clientY })
    setStartSize({ width: currentWidth, height: currentHeight })

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.x
      const deltaY = e.clientY - startPos.y
      
      // 그리드 단위로 계산 (각 그리드 셀 크기를 100px로 가정)
      const gridSize = 100
      const deltaGridX = Math.round(deltaX / gridSize)
      const deltaGridY = Math.round(deltaY / gridSize)

      let newWidth = startSize.width
      let newHeight = startSize.height

      if (direction.includes('right')) {
        newWidth = Math.max(1, Math.min(6, startSize.width + deltaGridX))
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(1, Math.min(4, startSize.height + deltaGridY))
      }

      setCurrentWidth(newWidth)
      setCurrentHeight(newHeight)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      if (onResize && (currentWidth !== widget.width || currentHeight !== widget.height)) {
        onResize(widget.id, currentWidth, currentHeight)
      }
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const style = {
    gridColumn: `span ${currentWidth}`,
    gridRow: `span ${currentHeight}`,
  }

  return (
    <div
      style={style}
      className={`relative ${isResizing ? 'z-40' : ''}`}
    >
      {children}
      
      {/* 리사이즈 핸들들 - 편집 모드일 때만 표시 */}
      {isEditMode && (
        <>
          {/* 우하단 리사이즈 핸들 */}
          <div
            ref={resizeHandleRef}
            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize opacity-70 hover:opacity-100 transition-opacity"
            style={{ 
              clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)',
              transform: 'translate(2px, 2px)'
            }}
            onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
          />
          
          {/* 우측 리사이즈 핸들 */}
          <div
            className="absolute top-1/2 right-0 w-2 h-8 bg-blue-500 cursor-e-resize opacity-0 hover:opacity-70 transition-opacity"
            style={{ transform: 'translate(2px, -50%)' }}
            onMouseDown={(e) => handleResizeStart(e, 'right')}
          />
          
          {/* 하단 리사이즈 핸들 */}
          <div
            className="absolute bottom-0 left-1/2 w-8 h-2 bg-blue-500 cursor-s-resize opacity-0 hover:opacity-70 transition-opacity"
            style={{ transform: 'translate(-50%, 2px)' }}
            onMouseDown={(e) => handleResizeStart(e, 'bottom')}
          />
        </>
      )}
      
      {/* 리사이징 중일 때 크기 표시 */}
      {isResizing && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded z-50">
          {currentWidth} × {currentHeight}
        </div>
      )}
    </div>
  )
}
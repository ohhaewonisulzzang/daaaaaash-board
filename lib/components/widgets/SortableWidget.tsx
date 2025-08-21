'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { IWidget } from '@/types'
import { GripVertical } from 'lucide-react'

interface ISortableWidgetProps {
  id: string
  widget: IWidget
  isEditMode: boolean
  children: React.ReactNode
}

export default function SortableWidget({ 
  id, 
  widget, 
  isEditMode, 
  children 
}: ISortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    // 드래그 핸들 영역만 드래그 가능하도록 설정
    data: {
      type: 'widget',
      widget,
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 150ms ease',
    gridColumn: `span ${widget.width}`,
    gridRow: `span ${widget.height}`,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'rotate-3 scale-105' : ''}`}
    >
      {/* 드래그 핸들 - 편집 모드일 때만 표시 */}
      {isEditMode && (
        <div
          className="absolute top-2 left-2 z-10 p-1 bg-blue-500 rounded cursor-move opacity-70 hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-3 h-3 text-white" />
        </div>
      )}
      
      {/* 위젯 내용 - 드래그 이벤트 차단 */}
      <div 
        className="h-full w-full"
        onMouseDown={(e) => {
          // 드래그 핸들이 아닌 영역에서는 드래그 이벤트 차단
          if (!isEditMode) return
          const target = e.target as HTMLElement
          const isDragHandle = target.closest('[data-drag-handle]')
          if (!isDragHandle) {
            e.stopPropagation()
          }
        }}
      >
        {children}
      </div>
    </div>
  )
}
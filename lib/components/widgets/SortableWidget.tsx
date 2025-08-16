'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { IWidget } from '@/types'

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
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${widget.width}`,
    gridRow: `span ${widget.height}`,
    opacity: isDragging ? 0.5 : 1,
  }

  // 편집 모드가 아니면 드래그 비활성화
  const dragProps = isEditMode ? { ...attributes, ...listeners } : {}

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isEditMode ? 'cursor-move' : ''} ${isDragging ? 'z-50' : ''}`}
      {...dragProps}
    >
      {children}
    </div>
  )
}
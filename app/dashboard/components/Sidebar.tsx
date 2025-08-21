import { Card } from '@/lib/components/ui/card'
import { Button } from '@/lib/components/ui/button'
import { Divider } from '@/lib/components/ui/divider'
import { 
  Plus, Clock, Link as LinkIcon, List, Cloud, FileText, 
  Search, Calendar as CalendarIcon, Palette, Layout
} from 'lucide-react'

interface SidebarProps {
  isSidebarOpen: boolean
  onOpenAddWidgetModal: (type: string) => void
  onOpenSettingsModal: () => void
  onLayoutReset: () => void
}

export default function Sidebar({
  isSidebarOpen,
  onOpenAddWidgetModal,
  onOpenSettingsModal,
  onLayoutReset
}: SidebarProps) {
  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] glass-effect border-r border-white/20 dark:border-gray-800/40 transition-all duration-500 cubic-bezier(0.25, 0.46, 0.45, 0.94) z-10 ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } w-80 lg:w-80 md:w-72 sm:w-64 overflow-y-auto custom-scrollbar animate-macos-fade-in`}>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">위젯 추가</h2>
        
        <div className="space-y-3">
          <Card 
            className="p-4 cursor-pointer macos-widget animate-macos-slide-in"
            onClick={() => onOpenAddWidgetModal('search')}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Search className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">검색 위젯</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  통합 검색 (Google, Naver 등)
                </div>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 cursor-pointer macos-widget animate-macos-slide-in"
            onClick={() => onOpenAddWidgetModal('weather')}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">날씨 위젯</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  현재 날씨 및 예보 정보
                </div>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 cursor-pointer macos-widget animate-macos-slide-in"
            onClick={() => onOpenAddWidgetModal('memo')}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">메모 위젯</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  빠른 메모 작성 및 관리
                </div>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 cursor-pointer macos-widget animate-macos-slide-in"
            onClick={() => onOpenAddWidgetModal('link')}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">링크 위젯</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  자주 사용하는 웹사이트 바로가기
                </div>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 cursor-pointer macos-widget animate-macos-slide-in"
            onClick={() => onOpenAddWidgetModal('checklist')}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <List className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">체크리스트 위젯</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  할 일 목록 관리
                </div>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 cursor-pointer macos-widget animate-macos-slide-in"
            onClick={() => onOpenAddWidgetModal('clock')}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">시계 위젯</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  현재 시간 표시
                </div>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 cursor-pointer macos-widget animate-macos-slide-in"
            onClick={() => onOpenAddWidgetModal('calendar')}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">캘린더 위젯</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  월별 캘린더 보기
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="h-6" />
        <Divider />
        <div className="h-6" />

        <h3 className="text-md font-semibold mb-4 text-gray-900 dark:text-white">대시보드 설정</h3>
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={onOpenSettingsModal}
          >
            <Palette className="w-4 h-4 mr-2" />
            배경 및 테마 변경
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={onLayoutReset}
          >
            <Layout className="w-4 h-4 mr-2" />
            레이아웃 초기화
          </Button>
        </div>
      </div>
    </div>
  )
}
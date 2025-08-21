import { Modal } from '@/lib/components/ui/modal'
import { Button } from '@/lib/components/ui/button'
import { Select } from '@/lib/components/ui/select'
import { ImageUpload } from '@/lib/components/ui/image-upload'
import { DataManager } from '@/lib/components/dashboard/DataManager'
import { IDashboard, IBackgroundOption } from '@/types'
import { useToast } from '@/lib/hooks/use-toast'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  dashboard: IDashboard | null
  backgroundOptions: IBackgroundOption[]
  onUpdateBackground: (background: IBackgroundOption) => void
  onImageUpload: (imageUrl: string) => void
  onImageRemove: () => void
  isGuestMode: boolean
  onShowLoginModal: () => void
  onImportSuccess: () => void
}

export default function SettingsModal({
  isOpen,
  onClose,
  dashboard,
  backgroundOptions,
  onUpdateBackground,
  onImageUpload,
  onImageRemove,
  isGuestMode,
  onShowLoginModal,
  onImportSuccess
}: SettingsModalProps) {
  const { toast } = useToast()

  const handleImportSuccess = () => {
    onImportSuccess()
    onClose()
    toast({
      title: '성공',
      description: '페이지를 새로고침하여 변경사항을 확인하세요.'
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="대시보드 설정"
    >
      <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar pr-2">
        {/* 배경 설정 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">배경 설정</h3>
          
          {/* 이미지 업로드 섹션 */}
          <div className="mb-4">
            <h4 className="text-md font-medium mb-2">사용자 정의 이미지</h4>
            <ImageUpload
              onUpload={onImageUpload}
              currentImage={
                dashboard?.background_type === 'image' 
                  ? dashboard.background_value?.replace(/^url\(|\)$/g, '').replace(/['"]/g, '')
                  : undefined
              }
              onRemove={onImageRemove}
              className="mb-3"
              isGuestMode={isGuestMode}
              onShowLoginModal={onShowLoginModal}
            />
          </div>

          {/* 프리셋 배경들 */}
          <div>
            <h4 className="text-md font-medium mb-2">프리셋 배경</h4>
            <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                {backgroundOptions.map((option, index) => (
                  <div
                    key={index}
                    className="cursor-pointer border-2 rounded-lg p-3 hover:border-blue-300 transition-colors"
                    style={{
                      background: option.value,
                      borderColor: dashboard?.background_value === option.value ? '#3b82f6' : '#e5e7eb'
                    }}
                    onClick={() => onUpdateBackground(option)}
                  >
                    <div className="h-16 rounded mb-2"></div>
                    <p className="text-sm font-medium text-center text-gray-700">
                      {option.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 레이아웃 설정 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">레이아웃 설정</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">그리드 열 수</label>
              <Select
                value={dashboard?.layout_settings?.gridCols?.toString() || '4'}
                onChange={(value) => {
                  // TODO: 레이아웃 설정 업데이트
                }}
                options={[
                  { value: '3', label: '3열' },
                  { value: '4', label: '4열' },
                  { value: '5', label: '5열' },
                  { value: '6', label: '6열' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* 데이터 관리 섹션 */}
        <DataManager 
          onImportSuccess={handleImportSuccess}
          isGuestMode={isGuestMode}
          onShowLoginModal={onShowLoginModal}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  )
}
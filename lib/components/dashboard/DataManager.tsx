'use client'

import { useState } from 'react'
import { Download, Upload, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/lib/components/ui/button'

interface DataManagerProps {
  onImportSuccess?: () => void
  isGuestMode?: boolean
  onShowLoginModal?: () => void
}

export function DataManager({ onImportSuccess, isGuestMode = false, onShowLoginModal }: DataManagerProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleExport = async () => {
    // 게스트 모드에서는 로그인 모달 표시
    if (isGuestMode) {
      if (onShowLoginModal) {
        onShowLoginModal()
      }
      return
    }

    try {
      setIsExporting(true)
      
      const response = await fetch('/api/dashboard/export', {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('데이터 내보내기에 실패했습니다')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dashboard-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setStatus({
        type: 'success',
        message: '백업 파일을 성공적으로 다운로드했습니다!'
      })

    } catch (error) {
      setStatus({
        type: 'error',
        message: '데이터 내보내기에 실패했습니다'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // 게스트 모드에서는 로그인 모달 표시
    if (isGuestMode) {
      if (onShowLoginModal) {
        onShowLoginModal()
      }
      return
    }

    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsImporting(true)
      setStatus({ type: null, message: '' })

      const fileContent = await file.text()
      const importData = JSON.parse(fileContent)

      const response = await fetch('/api/dashboard/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '데이터 가져오기에 실패했습니다')
      }

      setStatus({
        type: 'success',
        message: `백업 데이터를 성공적으로 복원했습니다! (위젯 ${result.importedWidgets}개)`
      })

      if (onImportSuccess) {
        setTimeout(onImportSuccess, 1000)
      }

    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : '데이터 가져오기에 실패했습니다'
      })
    } finally {
      setIsImporting(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-dark-bg-secondary rounded-xl border border-border-light dark:border-gray-600">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
          백업 및 복원
        </h3>
        <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
          대시보드 설정과 위젯을 백업하거나 복원할 수 있습니다.
        </p>
      </div>

      {status.type && (
        <div className={`p-4 rounded-lg border flex items-center space-x-3 ${
          status.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
        }`}>
          {status.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 dark:text-dark-text flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>데이터 내보내기</span>
          </h4>
          <p className="text-xs text-gray-500 dark:text-dark-text-muted">
            현재 대시보드 설정과 모든 위젯을 JSON 파일로 백업합니다.
          </p>
          <Button 
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
            variant={isGuestMode ? "outline" : "default"}
          >
            <Download className="w-4 h-4 mr-2" />
            {isGuestMode ? '로그인 후 이용 가능' : (isExporting ? '내보내는 중...' : '백업 파일 다운로드')}
          </Button>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 dark:text-dark-text flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>데이터 가져오기</span>
          </h4>
          <p className="text-xs text-gray-500 dark:text-dark-text-muted">
            백업 파일을 업로드하여 대시보드를 복원합니다.
          </p>
          
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-xs text-yellow-800 dark:text-yellow-200">
                <p className="font-medium">주의사항</p>
                <p>데이터를 가져오면 현재 설정이 완전히 대체됩니다.</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              disabled={isImporting || isGuestMode}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            {isGuestMode && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                ⚠️ 파일 가져오기는 로그인 후 이용할 수 있습니다.
              </p>
            )}
            {isImporting && (
              <div className="text-center py-2">
                <div className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-dark-text-secondary">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-blue"></div>
                  <span>데이터를 복원하고 있습니다...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
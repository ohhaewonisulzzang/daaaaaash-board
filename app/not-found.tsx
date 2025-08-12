import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-600 mb-4">요청하신 페이지가 존재하지 않습니다.</p>
        <Link 
          href="/"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
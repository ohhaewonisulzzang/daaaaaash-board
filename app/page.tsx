import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          대시보드에 오신 것을 환영합니다
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Next.js, TypeScript, Tailwind CSS, Supabase로 구축된 현대적인 대시보드
        </p>
        <div className="space-x-4">
          <Link 
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            대시보드 보기
          </Link>
          <Link 
            href="/profile"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            프로필
          </Link>
        </div>
      </div>
    </main>
  )
}
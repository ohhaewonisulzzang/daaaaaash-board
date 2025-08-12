import { DashboardStats, RecentActivity } from './components'

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">대시보드</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <DashboardStats />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
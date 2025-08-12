export default function DashboardStats() {
  const stats = [
    { name: '총 게시글', value: '245', change: '+12%' },
    { name: '총 댓글', value: '1,234', change: '+8%' },
    { name: '총 조회수', value: '12,345', change: '+25%' },
    { name: '주간 성장률', value: '5.2%', change: '+2.1%' },
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">통계</h2>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.name}</div>
            <div className="text-xs text-green-600">{stat.change}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
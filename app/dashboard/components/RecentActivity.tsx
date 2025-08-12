export default function RecentActivity() {
  const activities = [
    { id: 1, action: '새 게시글 작성', time: '2분 전', user: '김철수' },
    { id: 2, action: '댓글 작성', time: '5분 전', user: '이영희' },
    { id: 3, action: '프로필 업데이트', time: '10분 전', user: '박민수' },
    { id: 4, action: '새 사용자 가입', time: '15분 전', user: '최지은' },
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">최근 활동</h2>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <div className="font-medium text-gray-900">{activity.action}</div>
              <div className="text-sm text-gray-600">{activity.user}</div>
            </div>
            <div className="text-sm text-gray-500">{activity.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
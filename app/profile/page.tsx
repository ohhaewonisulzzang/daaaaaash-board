export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">프로필</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">사용자</h2>
          <p className="text-gray-600">user@example.com</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="이름을 입력하세요"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input 
              type="email" 
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="이메일을 입력하세요"
            />
          </div>
          
          <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
            프로필 저장
          </button>
        </div>
      </div>
    </div>
  )
}
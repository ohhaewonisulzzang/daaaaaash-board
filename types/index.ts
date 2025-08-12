// 공통 타입 정의

export interface IUser {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface IPost {
  id: string
  title: string
  content: string
  authorId: string
  author?: IUser
  createdAt: string
  updatedAt: string
}

export interface IComment {
  id: string
  text: string
  postId: string
  authorId: string
  author?: IUser
  createdAt: string
  updatedAt: string
}

export interface IDashboardStats {
  totalPosts: number
  totalComments: number
  totalViews: number
  weeklyGrowth: number
}

export interface IApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
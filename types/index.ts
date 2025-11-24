// 学生信息
export interface Student {
  id: string
  student_id: string
  name: string
  gender: 'male' | 'female'
  birth_date: string
  phone?: string
  email?: string
  address?: string
  class_name: string
  enrollment_date: string
  status: 'active' | 'graduated' | 'suspended' | 'transferred'
  created_at: string
  updated_at: string
}

// 成绩信息
export interface Grade {
  id: string
  student_id: string
  subject: string
  score: number
  exam_type: 'midterm' | 'final' | 'quiz' | 'homework'
  exam_date: string
  semester: string
  created_at: string
  updated_at: string
}

// 学生档案
export interface Archive {
  id: string
  student_id: string
  title: string
  content: string
  type: 'reward' | 'punishment' | 'activity' | 'note'
  date: string
  created_by: string
  created_at: string
  updated_at: string
}

// 用户信息
export interface User {
  id: string
  email: string
  name?: string
  role: 'admin' | 'teacher' | 'staff'
  created_at: string
  updated_at: string
}

// 登录记录
export interface LoginRecord {
  id: string
  user_id: string
  ip_address: string
  user_agent: string
  login_time: string
  logout_time?: string
  status: 'success' | 'failed'
}

// 表单数据类型
export interface StudentForm {
  student_id: string
  name: string
  gender: 'male' | 'female'
  birth_date: string
  phone?: string
  email?: string
  address?: string
  class_name: string
  enrollment_date: string
  status: 'active' | 'graduated' | 'suspended' | 'transferred'
}

export interface GradeForm {
  student_id: string
  subject: string
  score: number
  exam_type: 'midterm' | 'final' | 'quiz' | 'homework'
  exam_date: string
  semester: string
}

export interface ArchiveForm {
  student_id: string
  title: string
  content: string
  type: 'reward' | 'punishment' | 'activity' | 'note'
  date: string
}

// API 响应类型
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// 分页参数
export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

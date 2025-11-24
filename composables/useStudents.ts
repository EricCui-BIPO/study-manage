import type { Student, StudentForm, PaginatedResponse } from '~/types'

export const useStudents = () => {
  const supabase = useSupabase()
  const students = useState<Student[]>('students', () => [])
  const loading = useState<boolean>('students-loading', () => false)
  const error = useState<string | null>('students-error', () => null)

  const fetchStudents = async (page = 1, pageSize = 10, search = '') => {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('students')
        .select('*', { count: 'exact' })

      if (search) {
        query = query.or(`name.ilike.%${search}%,student_id.ilike.%${search}%`)
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error: fetchError, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (fetchError) throw fetchError

      students.value = data || []

      return {
        data: data || [],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
      } as PaginatedResponse<Student>
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  const getStudent = async (id: string) => {
    const { data, error: fetchError } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    return data as Student
  }

  const createStudent = async (student: StudentForm) => {
    const { data, error: createError } = await supabase
      .from('students')
      .insert([student])
      .select()
      .single()

    if (createError) throw createError
    return data as Student
  }

  const updateStudent = async (id: string, student: Partial<StudentForm>) => {
    const { data, error: updateError } = await supabase
      .from('students')
      .update({ ...student, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError
    return data as Student
  }

  const deleteStudent = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('students')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError
  }

  return {
    students,
    loading,
    error,
    fetchStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
  }
}

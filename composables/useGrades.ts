import type { Grade, GradeForm, PaginatedResponse } from '~/types'

export const useGrades = () => {
  const supabase = useSupabase()
  const grades = useState<Grade[]>('grades', () => [])
  const loading = useState<boolean>('grades-loading', () => false)
  const error = useState<string | null>('grades-error', () => null)

  const fetchGrades = async (page = 1, pageSize = 10, studentId?: string, subject?: string) => {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('grades')
        .select('*, students(name, student_id)', { count: 'exact' })

      if (studentId) {
        query = query.eq('student_id', studentId)
      }

      if (subject) {
        query = query.eq('subject', subject)
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error: fetchError, count } = await query
        .order('exam_date', { ascending: false })
        .range(from, to)

      if (fetchError) throw fetchError

      grades.value = data || []

      return {
        data: data || [],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
      } as PaginatedResponse<Grade>
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  const getGrade = async (id: string) => {
    const { data, error: fetchError } = await supabase
      .from('grades')
      .select('*, students(name, student_id)')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    return data as Grade
  }

  const createGrade = async (grade: GradeForm) => {
    const { data, error: createError } = await supabase
      .from('grades')
      .insert([grade])
      .select()
      .single()

    if (createError) throw createError
    return data as Grade
  }

  const updateGrade = async (id: string, grade: Partial<GradeForm>) => {
    const { data, error: updateError } = await supabase
      .from('grades')
      .update({ ...grade, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError
    return data as Grade
  }

  const deleteGrade = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('grades')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError
  }

  const getStudentGradeStats = async (studentId: string) => {
    const { data, error: fetchError } = await supabase
      .from('grades')
      .select('subject, score')
      .eq('student_id', studentId)

    if (fetchError) throw fetchError

    // 计算平均分
    const subjects: Record<string, { total: number; count: number }> = {}
    data?.forEach((grade) => {
      if (!subjects[grade.subject]) {
        subjects[grade.subject] = { total: 0, count: 0 }
      }
      subjects[grade.subject].total += grade.score
      subjects[grade.subject].count += 1
    })

    const stats = Object.entries(subjects).map(([subject, { total, count }]) => ({
      subject,
      average: Math.round((total / count) * 100) / 100,
      count,
    }))

    return stats
  }

  return {
    grades,
    loading,
    error,
    fetchGrades,
    getGrade,
    createGrade,
    updateGrade,
    deleteGrade,
    getStudentGradeStats,
  }
}

import type { Archive, ArchiveForm, PaginatedResponse } from '~/types'

export const useArchives = () => {
  const supabase = useSupabase()
  const archives = useState<Archive[]>('archives', () => [])
  const loading = useState<boolean>('archives-loading', () => false)
  const error = useState<string | null>('archives-error', () => null)

  const fetchArchives = async (page = 1, pageSize = 10, studentId?: string, type?: string) => {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('archives')
        .select('*, students(name, student_id)', { count: 'exact' })

      if (studentId) {
        query = query.eq('student_id', studentId)
      }

      if (type) {
        query = query.eq('type', type)
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error: fetchError, count } = await query
        .order('date', { ascending: false })
        .range(from, to)

      if (fetchError) throw fetchError

      archives.value = data || []

      return {
        data: data || [],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
      } as PaginatedResponse<Archive>
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  const getArchive = async (id: string) => {
    const { data, error: fetchError } = await supabase
      .from('archives')
      .select('*, students(name, student_id)')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    return data as Archive
  }

  const createArchive = async (archive: ArchiveForm & { created_by: string }) => {
    const { data, error: createError } = await supabase
      .from('archives')
      .insert([archive])
      .select()
      .single()

    if (createError) throw createError
    return data as Archive
  }

  const updateArchive = async (id: string, archive: Partial<ArchiveForm>) => {
    const { data, error: updateError } = await supabase
      .from('archives')
      .update({ ...archive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError
    return data as Archive
  }

  const deleteArchive = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('archives')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError
  }

  return {
    archives,
    loading,
    error,
    fetchArchives,
    getArchive,
    createArchive,
    updateArchive,
    deleteArchive,
  }
}

import type { LoginRecord, PaginatedResponse } from '~/types'

export const useLoginRecords = () => {
  const supabase = useSupabase()
  const records = useState<LoginRecord[]>('login-records', () => [])
  const loading = useState<boolean>('login-records-loading', () => false)
  const error = useState<string | null>('login-records-error', () => null)

  const fetchLoginRecords = async (page = 1, pageSize = 10, userId?: string) => {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('login_records')
        .select('*', { count: 'exact' })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error: fetchError, count } = await query
        .order('login_time', { ascending: false })
        .range(from, to)

      if (fetchError) throw fetchError

      records.value = data || []

      return {
        data: data || [],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
      } as PaginatedResponse<LoginRecord>
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  const recordLogin = async (userId: string, ipAddress: string, userAgent: string, status: 'success' | 'failed') => {
    const { data, error: createError } = await supabase
      .from('login_records')
      .insert([{
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        login_time: new Date().toISOString(),
        status,
      }])
      .select()
      .single()

    if (createError) throw createError
    return data as LoginRecord
  }

  return {
    records,
    loading,
    error,
    fetchLoginRecords,
    recordLogin,
  }
}

import type { User } from '@supabase/supabase-js'

export const useAuth = () => {
  const supabase = useSupabase()
  const user = useState<User | null>('user', () => null)
  const loading = useState<boolean>('auth-loading', () => true)

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    user.value = data.user
    return data
  }

  const signUp = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      throw error
    }

    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    user.value = null
    navigateTo('/login')
  }

  const getUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    user.value = currentUser
    loading.value = false
    return currentUser
  }

  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      throw error
    }

    return data
  }

  const updateEmail = async (newEmail: string) => {
    const { data, error } = await supabase.auth.updateUser({
      email: newEmail,
    })

    if (error) {
      throw error
    }

    return data
  }

  // 初始化监听器
  const initAuthListener = () => {
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null
      loading.value = false

      if (event === 'SIGNED_OUT') {
        navigateTo('/login')
      }
    })
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    getUser,
    updatePassword,
    updateEmail,
    initAuthListener,
  }
}

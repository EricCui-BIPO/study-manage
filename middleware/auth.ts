export default defineNuxtRouteMiddleware(async (to) => {
  const { getUser, user } = useAuth()

  // 如果还没有获取用户信息，则获取
  if (!user.value) {
    await getUser()
  }

  // 如果用户未登录且不是访问登录页面，则重定向到登录页
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  // 如果用户已登录且访问登录页面，则重定向到首页
  if (user.value && to.path === '/login') {
    return navigateTo('/')
  }
})

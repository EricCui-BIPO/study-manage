<script setup lang="ts">
import {
  Users,
  GraduationCap,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
} from 'lucide-vue-next'

const { user, signOut } = useAuth()
const route = useRoute()

const sidebarOpen = ref(false)

const navigation = [
  { name: '首页', href: '/', icon: Home },
  { name: '学生管理', href: '/students', icon: Users },
  { name: '成绩管理', href: '/grades', icon: GraduationCap },
  { name: '学生档案', href: '/archives', icon: FileText },
  { name: '系统设置', href: '/settings', icon: Settings },
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const handleLogout = async () => {
  await signOut()
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Mobile sidebar backdrop -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Mobile sidebar -->
    <div
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex items-center justify-between h-16 px-4 border-b">
        <span class="text-xl font-semibold text-gray-800">学生管理系统</span>
        <button @click="sidebarOpen = false" class="p-2 rounded-md hover:bg-gray-100">
          <X class="w-5 h-5" />
        </button>
      </div>
      <nav class="flex-1 px-2 py-4 space-y-1">
        <NuxtLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          :class="[
            'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
            isActive(item.href)
              ? 'bg-primary text-primary-foreground'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
          @click="sidebarOpen = false"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.name }}
        </NuxtLink>
      </nav>
    </div>

    <!-- Desktop sidebar -->
    <div class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div class="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
        <div class="flex items-center h-16 flex-shrink-0 px-4 border-b">
          <span class="text-xl font-semibold text-gray-800">学生管理系统</span>
        </div>
        <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <NuxtLink
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            :class="[
              'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
              isActive(item.href)
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5 mr-3" />
            {{ item.name }}
          </NuxtLink>
        </nav>
        <div class="flex-shrink-0 p-4 border-t">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {{ user?.email?.charAt(0).toUpperCase() || 'U' }}
              </div>
            </div>
            <div class="ml-3 flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-700 truncate">
                {{ user?.email || '用户' }}
              </p>
            </div>
            <button
              @click="handleLogout"
              class="p-2 ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              title="退出登录"
            >
              <LogOut class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="lg:pl-64">
      <!-- Top bar for mobile -->
      <div class="sticky top-0 z-10 flex items-center h-16 bg-white border-b border-gray-200 lg:hidden">
        <button
          @click="sidebarOpen = true"
          class="px-4 text-gray-500 focus:outline-none"
        >
          <Menu class="w-6 h-6" />
        </button>
        <span class="text-lg font-semibold text-gray-800">学生管理系统</span>
      </div>

      <!-- Page content -->
      <main class="p-4 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

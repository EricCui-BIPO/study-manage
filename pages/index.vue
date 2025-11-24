<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Users, GraduationCap, FileText, TrendingUp } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
})

const supabase = useSupabase()

const stats = ref({
  totalStudents: 0,
  activeStudents: 0,
  totalGrades: 0,
  totalArchives: 0,
})

const loading = ref(true)

const fetchStats = async () => {
  try {
    // 获取学生统计
    const { count: totalStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })

    const { count: activeStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // 获取成绩统计
    const { count: totalGrades } = await supabase
      .from('grades')
      .select('*', { count: 'exact', head: true })

    // 获取档案统计
    const { count: totalArchives } = await supabase
      .from('archives')
      .select('*', { count: 'exact', head: true })

    stats.value = {
      totalStudents: totalStudents || 0,
      activeStudents: activeStudents || 0,
      totalGrades: totalGrades || 0,
      totalArchives: totalArchives || 0,
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})

const statCards = computed(() => [
  {
    title: '学生总数',
    value: stats.value.totalStudents,
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: '在校学生',
    value: stats.value.activeStudents,
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: '成绩记录',
    value: stats.value.totalGrades,
    icon: GraduationCap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: '档案记录',
    value: stats.value.totalArchives,
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
])
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">仪表盘</h1>
      <p class="mt-1 text-sm text-gray-500">欢迎使用学生管理系统</p>
    </div>

    <div v-if="loading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card v-for="i in 4" :key="i" class="animate-pulse">
        <CardContent class="p-6">
          <div class="h-20 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card v-for="stat in statCards" :key="stat.title">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium text-gray-500">
            {{ stat.title }}
          </CardTitle>
          <div :class="[stat.bgColor, 'p-2 rounded-lg']">
            <component :is="stat.icon" :class="['w-5 h-5', stat.color]" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-bold">{{ stat.value }}</div>
        </CardContent>
      </Card>
    </div>

    <div class="mt-8 grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
        </CardHeader>
        <CardContent class="grid gap-2">
          <NuxtLink
            to="/students"
            class="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Users class="w-5 h-5 mr-3 text-blue-600" />
            <span>管理学生信息</span>
          </NuxtLink>
          <NuxtLink
            to="/grades"
            class="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <GraduationCap class="w-5 h-5 mr-3 text-purple-600" />
            <span>录入学生成绩</span>
          </NuxtLink>
          <NuxtLink
            to="/archives"
            class="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FileText class="w-5 h-5 mr-3 text-orange-600" />
            <span>查看学生档案</span>
          </NuxtLink>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>系统信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">系统版本</span>
              <span>1.0.0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">技术栈</span>
              <span>Nuxt 3 + Supabase</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">UI 框架</span>
              <span>Shadcn-vue + TailwindCSS</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

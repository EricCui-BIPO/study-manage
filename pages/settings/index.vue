<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { ChevronLeft, ChevronRight, Key, Mail, Shield } from 'lucide-vue-next'
import type { LoginRecord } from '~/types'

definePageMeta({
  middleware: 'auth',
})

const { user, updatePassword, updateEmail } = useAuth()
const { records, loading: recordsLoading, fetchLoginRecords } = useLoginRecords()

// Password form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const passwordLoading = ref(false)
const passwordMessage = ref({ type: '', text: '' })

// Email form
const emailForm = ref({
  newEmail: '',
  confirmEmail: '',
})
const emailLoading = ref(false)
const emailMessage = ref({ type: '', text: '' })

// Login records pagination
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)
const totalCount = ref(0)

const handlePasswordChange = async () => {
  passwordMessage.value = { type: '', text: '' }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordMessage.value = { type: 'error', text: '两次输入的密码不一致' }
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    passwordMessage.value = { type: 'error', text: '密码长度至少为6位' }
    return
  }

  passwordLoading.value = true
  try {
    await updatePassword(passwordForm.value.newPassword)
    passwordMessage.value = { type: 'success', text: '密码修改成功' }
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (error) {
    passwordMessage.value = { type: 'error', text: (error as Error).message || '密码修改失败' }
  } finally {
    passwordLoading.value = false
  }
}

const handleEmailChange = async () => {
  emailMessage.value = { type: '', text: '' }

  if (emailForm.value.newEmail !== emailForm.value.confirmEmail) {
    emailMessage.value = { type: 'error', text: '两次输入的邮箱不一致' }
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailForm.value.newEmail)) {
    emailMessage.value = { type: 'error', text: '请输入有效的邮箱地址' }
    return
  }

  emailLoading.value = true
  try {
    await updateEmail(emailForm.value.newEmail)
    emailMessage.value = { type: 'success', text: '邮箱更换请求已发送，请查收验证邮件' }
    emailForm.value = { newEmail: '', confirmEmail: '' }
  } catch (error) {
    emailMessage.value = { type: 'error', text: (error as Error).message || '邮箱更换失败' }
  } finally {
    emailLoading.value = false
  }
}

const loadLoginRecords = async () => {
  if (!user.value?.id) return
  const result = await fetchLoginRecords(currentPage.value, pageSize.value, user.value.id)
  totalPages.value = result.pagination.totalPages
  totalCount.value = result.pagination.total
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadLoginRecords()
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const getStatusBadge = (status: string) => {
  return status === 'success'
    ? { label: '成功', variant: 'default' as const }
    : { label: '失败', variant: 'destructive' as const }
}

onMounted(() => {
  loadLoginRecords()
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">系统设置</h1>
      <p class="mt-1 text-sm text-gray-500">管理您的账户设置和安全选项</p>
    </div>

    <Tabs default-value="password" class="w-full">
      <TabsList class="grid w-full grid-cols-3 max-w-[400px]">
        <TabsTrigger value="password">修改密码</TabsTrigger>
        <TabsTrigger value="email">更换邮箱</TabsTrigger>
        <TabsTrigger value="logs">登录记录</TabsTrigger>
      </TabsList>

      <!-- Password Tab -->
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <div class="flex items-center space-x-2">
              <Key class="w-5 h-5 text-primary" />
              <CardTitle>修改密码</CardTitle>
            </div>
            <CardDescription>请输入您的新密码，密码长度至少为6位</CardDescription>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="handlePasswordChange" class="space-y-4 max-w-md">
              <div class="space-y-2">
                <Label for="currentPassword">当前密码</Label>
                <Input
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  type="password"
                  placeholder="请输入当前密码"
                />
              </div>
              <div class="space-y-2">
                <Label for="newPassword">新密码</Label>
                <Input
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  required
                />
              </div>
              <div class="space-y-2">
                <Label for="confirmPassword">确认新密码</Label>
                <Input
                  id="confirmPassword"
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  required
                />
              </div>
              <div
                v-if="passwordMessage.text"
                :class="[
                  'text-sm p-3 rounded-md',
                  passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                ]"
              >
                {{ passwordMessage.text }}
              </div>
              <Button type="submit" :disabled="passwordLoading">
                {{ passwordLoading ? '提交中...' : '修改密码' }}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Email Tab -->
      <TabsContent value="email">
        <Card>
          <CardHeader>
            <div class="flex items-center space-x-2">
              <Mail class="w-5 h-5 text-primary" />
              <CardTitle>更换邮箱</CardTitle>
            </div>
            <CardDescription>
              当前绑定邮箱：{{ user?.email || '未绑定' }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="handleEmailChange" class="space-y-4 max-w-md">
              <div class="space-y-2">
                <Label for="newEmail">新邮箱</Label>
                <Input
                  id="newEmail"
                  v-model="emailForm.newEmail"
                  type="email"
                  placeholder="请输入新邮箱"
                  required
                />
              </div>
              <div class="space-y-2">
                <Label for="confirmEmail">确认新邮箱</Label>
                <Input
                  id="confirmEmail"
                  v-model="emailForm.confirmEmail"
                  type="email"
                  placeholder="请再次输入新邮箱"
                  required
                />
              </div>
              <div
                v-if="emailMessage.text"
                :class="[
                  'text-sm p-3 rounded-md',
                  emailMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                ]"
              >
                {{ emailMessage.text }}
              </div>
              <Button type="submit" :disabled="emailLoading">
                {{ emailLoading ? '提交中...' : '更换邮箱' }}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Login Logs Tab -->
      <TabsContent value="logs">
        <Card>
          <CardHeader>
            <div class="flex items-center space-x-2">
              <Shield class="w-5 h-5 text-primary" />
              <CardTitle>登录记录</CardTitle>
            </div>
            <CardDescription>查看您的账户登录历史记录</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>登录时间</TableHead>
                  <TableHead>IP 地址</TableHead>
                  <TableHead>设备信息</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="recordsLoading">
                  <TableCell colspan="4" class="text-center py-8 text-gray-500">
                    加载中...
                  </TableCell>
                </TableRow>
                <TableRow v-else-if="records.length === 0">
                  <TableCell colspan="4" class="text-center py-8 text-gray-500">
                    暂无登录记录
                  </TableCell>
                </TableRow>
                <TableRow v-for="record in records" :key="record.id">
                  <TableCell>{{ formatDateTime(record.login_time) }}</TableCell>
                  <TableCell class="font-mono">{{ record.ip_address }}</TableCell>
                  <TableCell class="max-w-xs truncate" :title="record.user_agent">
                    {{ record.user_agent }}
                  </TableCell>
                  <TableCell>
                    <Badge :variant="getStatusBadge(record.status).variant">
                      {{ getStatusBadge(record.status).label }}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <!-- Pagination -->
            <div class="flex items-center justify-between mt-4">
              <div class="text-sm text-gray-500">
                共 {{ totalCount }} 条记录
              </div>
              <div class="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  :disabled="currentPage <= 1"
                  @click="handlePageChange(currentPage - 1)"
                >
                  <ChevronLeft class="w-4 h-4" />
                </Button>
                <span class="text-sm">
                  第 {{ currentPage }} / {{ Math.max(totalPages, 1) }} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  :disabled="currentPage >= totalPages"
                  @click="handlePageChange(currentPage + 1)"
                >
                  <ChevronRight class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

definePageMeta({
  layout: 'auth',
  middleware: 'auth',
})

const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = '请输入邮箱和密码'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await signIn(email.value, password.value)
    navigateTo('/')
  } catch (error) {
    errorMessage.value = (error as Error).message || '登录失败，请检查邮箱和密码'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Card class="w-full max-w-md">
    <CardHeader class="space-y-1 text-center">
      <CardTitle class="text-2xl font-bold">学生管理系统</CardTitle>
      <CardDescription>请输入您的账号信息登录</CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div class="space-y-2">
          <Label for="email">邮箱</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="请输入邮箱"
            :disabled="loading"
          />
        </div>
        <div class="space-y-2">
          <Label for="password">密码</Label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            :disabled="loading"
          />
        </div>
        <div v-if="errorMessage" class="text-sm text-destructive">
          {{ errorMessage }}
        </div>
        <Button type="submit" class="w-full" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>

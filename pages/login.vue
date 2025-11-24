<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

definePageMeta({
  layout: 'auth',
  middleware: 'auth',
})

const { signIn, signUp } = useAuth()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const name = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const toggleMode = () => {
  isLogin.value = !isLogin.value
  errorMessage.value = ''
  successMessage.value = ''
}

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = '请输入邮箱和密码'
    return
  }

  if (!isLogin.value && !name.value) {
    errorMessage.value = '请输入姓名'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (isLogin.value) {
      await signIn(email.value, password.value)
      navigateTo('/')
    } else {
      await signUp(email.value, password.value, name.value)
      successMessage.value = '注册成功，请登录'
      isLogin.value = true
    }
  } catch (error) {
    errorMessage.value = (error as Error).message || (isLogin.value ? '登录失败，请检查邮箱和密码' : '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Card class="w-full max-w-md">
    <CardHeader class="space-y-1 text-center">
      <CardTitle class="text-2xl font-bold">学生管理系统</CardTitle>
      <CardDescription>{{ isLogin ? '请输入您的账号信息登录' : '创建一个新账号' }}</CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="!isLogin" class="space-y-2">
          <Label for="name">姓名</Label>
          <Input
            id="name"
            v-model="name"
            type="text"
            placeholder="请输入姓名"
            :disabled="loading"
          />
        </div>
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
        <div v-if="successMessage" class="text-sm text-green-600">
          {{ successMessage }}
        </div>
        <Button type="submit" class="w-full" :disabled="loading">
          {{ loading ? (isLogin ? '登录中...' : '注册中...') : (isLogin ? '登录' : '注册') }}
        </Button>
        <div class="text-center text-sm">
          <span class="text-gray-500">{{ isLogin ? '还没有账号？' : '已有账号？' }}</span>
          <button
            type="button"
            class="ml-1 text-primary hover:underline focus:outline-none"
            @click="toggleMode"
          >
            {{ isLogin ? '立即注册' : '直接登录' }}
          </button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import '~/assets/css/main.css'
const { initAuthListener } = useAuth()

onMounted(() => {
  initAuthListener()
})
</script>

<template>
  <NuxtLayout>
    <!-- Main Page Content -->
    <NuxtPage />
  </NuxtLayout>
</template>

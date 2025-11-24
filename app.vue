<script setup lang="ts">
const { initAuthListener } = useAuth()

onMounted(() => {
  initAuthListener()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useShortcutStore } from '@/stores'

const shortcutStore = useShortcutStore()

const name = ref('')
const url = ref('')
const add = () => {
  if (!name.value || !url.value) {
    ElMessage.error('请输入应用名称和URL')
    return
  }
  console.log('name', shortcutStore.addShortcut)
  shortcutStore.addShortcut({
    name: name.value,
    url: url.value,
  })
  name.value = ''
  url.value = ''
}
</script>

<template>
  <div class="w-[400px]">
    <SfInput v-model="name" placeholder="请输入应用名称" class="h-12 w-full" />
    <SfInput v-model="url" placeholder="请输入应用URL" class="h-12 w-full" />
    <ElButton type="primary" @click="add">添加</ElButton>
  </div>
</template>

<style lang="scss" scoped></style>

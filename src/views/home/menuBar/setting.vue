<template>
  <div></div>
  <ElDropdown trigger="hover">
    <sf-icon
      icon="iconamoon:settings-fill"
      size="8"
      class="text-sf-primary transition-all duration-200 hover:rotate-180"
    />

    <template #dropdown>
      <el-dropdown-menu class="w-[120px]">
        <div @click="openSet">功能设置</div>
        <SfSetting>
          <div>系统设置</div>
        </SfSetting>
      </el-dropdown-menu>
    </template>
  </ElDropdown>
</template>

<script setup>
import { useHomeStore } from '@/stores'
import { storeToRefs } from 'pinia'
provide('color', 'text-sf-base')
const homeStore = useHomeStore()
const { systemVisible } = storeToRefs(homeStore)
const openSet = () => {
  systemVisible.value = true
}
</script>

<style lang="scss" scoped></style>

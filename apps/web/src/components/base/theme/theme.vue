<template>
  <div class="text-sf-text" @click="toggleTheme">
    <ElDropdown trigger="hover">
      <SfIcon
        :icon="theme === 'dark' ? 'twemoji:sun' : 'ri:moon-clear-fill'"
        size="8"
        style="color: #f3d776"
        class="transition-all duration-300 hover:scale-120"
      />
      <template #dropdown>
        <el-dropdown-menu>
          <SfList
            class="w-[120px]"
            :list="list"
            activeKey="value"
            @onClick="handleClick"
            :activeValue="themeMode"
          >
            <template #default="{ item }">
              {{ item.name }}
            </template>
          </SfList>
        </el-dropdown-menu>
      </template>
    </ElDropdown>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores'

defineOptions({ name: 'SfTheme' })

const themeStore = useThemeStore()
const { setTheme } = themeStore
const { theme, themeMode } = storeToRefs(themeStore)
const toggleTheme = () => {
  setTheme(theme.value)
}
// 主题选项
const list = computed(() => {
  return [
    { name: $t('theme.system'), value: 'system' },
    { name: $t('theme.light'), value: 'light' },
    { name: $t('theme.dark'), value: 'dark' },
  ]
})

function handleClick(item) {
  setTheme(item.value)
}
</script>

<style scoped></style>

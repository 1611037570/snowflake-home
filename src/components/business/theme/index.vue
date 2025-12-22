<template>
  <div class="text-sf-text" @click="toggleTheme">
    <!-- <SfTooltip :content="theme === 'dark' ? '切换为浅色主题' : '切换为暗黑主题'">
      <SfIcon
        :icon="theme === 'dark' ? 'twemoji:sun' : 'ri:moon-clear-fill'"
        size="8"
        style="color: #f3d776"
      />
    </SfTooltip> -->
    <ElDropdown trigger="hover">
      <SfIcon
        :icon="theme === 'dark' ? 'twemoji:sun' : 'ri:moon-clear-fill'"
        size="8"
        style="color: #f3d776"
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
const themeStore = useThemeStore()
const { setTheme } = themeStore
const { theme, themeMode } = storeToRefs(themeStore)
const toggleTheme = () => {
  setTheme(theme.value)
}
// // 主题选项
const list = ref([
  { name: '跟随系统', value: 'system' },
  { name: '暗黑模式', value: 'dark' },
  { name: '白天模式', value: 'light' },
])

function handleClick(item) {
  setTheme(item.value)
}
</script>

<style scoped></style>

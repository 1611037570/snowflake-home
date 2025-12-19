<template>
  <div class="text-sf-text" @click="toggleTheme">
    <!-- <SfTooltip :content="themeMode === 'dark' ? '切换为浅色主题' : '切换为暗黑主题'">
      <SfIcon
        :icon="themeMode === 'dark' ? 'twemoji:sun' : 'ri:moon-clear-fill'"
        size="8"
        style="color: #f3d776"
      />
    </SfTooltip> -->
    <ElDropdown trigger="hover">
      <SfIcon
        :icon="themeMode === 'dark' ? 'twemoji:sun' : 'ri:moon-clear-fill'"
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
const { themeMode } = storeToRefs(themeStore)
const toggleTheme = () => {
  themeMode.value = themeMode.value === 'dark' ? 'light' : 'dark'
  setTheme(themeMode.value)
}
// // 主题选项
const list = ref([
  { name: '跟随系统', value: 'default' },
  { name: '暗黑模式', value: 'dark' },
  { name: '简约白色', value: 'light' },
])

function handleClick(item) {
  setTheme(item.value)
}
</script>

<style scoped></style>

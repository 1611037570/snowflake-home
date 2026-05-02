<script setup>
import { getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()

// 社交账号列表数据
const accounts = defineModel('modelValue', {
  type: Array,
  default: () => [],
})
if (!accounts.value) {
  accounts.value = []
}

// 点击按钮增加一组社交账号输入框（平台和网址）
const addAccount = () => {
  accounts.value.push({
    name: '',
    url: '',
  })
}

// 删除社交账号
const removeAccount = (index) => {
  proxy.$confirm('确定要删除当前内容吗？', '删除确认').then(() => {
    accounts.value.splice(index, 1)
  })
}
</script>

<template>
  <div class="flex w-full flex-col">
    <div class="flex flex-col gap-3">
      <div v-for="(item, index) in accounts" :key="index" class="flex items-center gap-3">
        <!-- 第一个是平台 -->
        <div class="min-w-0 flex-1">
          <SfInput v-model="item.name" placeholder="平台" />
        </div>
        <!-- 第二个是网址 -->
        <div class="min-w-0 flex-1">
          <SfInput v-model="item.url" placeholder="网址" />
        </div>
        <!-- 删除按钮 -->
        <SfIcon
          icon="ic:round-delete"
          size="4"
          boxSize="8"
          class="shrink-0 cursor-pointer rounded-lg transition-colors hover:text-sf-theme"
          @click="removeAccount(index)"
        />
      </div>
    </div>
    <div class="flex cursor-pointer items-center gap-1 text-sf-theme" @click="addAccount">
      <SfIcon icon="ic:round-add" size="4" />
      <span> 增加社交账号 </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 样式遵循 Tailwind CSS，无需额外 CSS */
</style>

<script setup>
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
  accounts.value.splice(index, 1)
}
</script>

<template>
  <div class="w-full">
    <ElButton type="primary" class="border-none bg-sf-theme" @click="addAccount">
      增加社交账号
    </ElButton>
    <div v-for="(item, index) in accounts" :key="index" class="mt-4 flex items-center gap-4">
      <!-- 第一个是平台 -->
      <SfInput v-model="item.name" placeholder="平台" />
      <!-- 第二个是网址 -->
      <SfInput v-model="item.url" placeholder="网址" />
      <!-- 删除按钮 -->
      <SfIcon
        icon="ic:round-delete"
        size="5"
        boxSize="8"
        class="cursor-pointer rounded-lg hover:bg-sf-bg-hover hover:text-sf-theme"
        @click="removeAccount(index)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 样式遵循 Tailwind CSS，无需额外 CSS */
</style>

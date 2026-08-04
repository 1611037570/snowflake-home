<script setup>
import { useCopy } from '@/hooks'
import { usePasswordStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

const passwordStore = usePasswordStore()
const { showPassword } = storeToRefs(passwordStore)

// 模拟数据
const list = ref([
  {
    name: '微信',
    account: '13000000000',
    password: '123456',
    url: '',
  },
  {
    name: 'QQ',
    account: '13000000000',
    password: '123456',
    url: '',
  },
])

// 类型列表 - 只返回第一个唯一类型
const typeList = computed(() => {
  // 过滤出唯一的类型名称
  const uniqueTypes = new Set(list.value.map((item) => item.name))
  // 如果有类型，只返回第一个
  return uniqueTypes.size > 0 ? [Array.from(uniqueTypes)[0]] : []
})
</script>

<template>
  <SfViewContainer>
    <div class="flex-c h-full w-full">
      <div class="border-sf-b h-120 w-120 border">
        <h1>密码箱</h1>
        <div>明文显示：<ElSwitch v-model="showPassword" /></div>
        <SfScrollbarTab :list="typeList" class="bg-sf-bg-hover" />
        <ElScrollbar>
          <div v-for="(item, index) in list" :key="index" class="mb-2 rounded-xl bg-sf-bg p-1">
            <div class="flex items-center">
              平台：{{ item.name }}
              <SfIcon name="link" class="ml-2" v-if="item.url" />
            </div>
            <div class="cursor-pointer" @click="useCopy(item.account)">
              账号：
              <span class="hover:text-sf-theme-hover">
                {{ item.account }}
              </span>
            </div>
            <div class="cursor-pointer" @click="useCopy(item.password)">
              密码：
              <span class="hover:text-sf-theme-hover">
                {{ showPassword ? item.password : '******' }}
              </span>
            </div>
          </div>
        </ElScrollbar>
      </div>
    </div>
  </SfViewContainer>
</template>

<style lang="scss" scoped></style>

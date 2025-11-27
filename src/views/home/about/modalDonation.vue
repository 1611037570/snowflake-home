<template>
  <div class="mx-auto flex max-w-md flex-col items-center p-6">
    <!-- 标题 -->
    <h3 class="mb-4 text-center text-xl font-semibold text-blue-600">支持项目发展</h3>

    <!-- 描述 -->
    <div class="mb-6 text-center leading-relaxed text-gray-700">
      如果您也喜欢我的项目，简单的捐赠就是对我最大的物质和精神支持。
    </div>

    <!-- 支付方式容器 -->
    <div class="my-6 grid w-full grid-cols-2 gap-8">
      <div
        v-for="item in list"
        :key="item.name"
        class="flex flex-col items-center transition-all duration-300"
      >
        <div
          class="h-64 w-48 overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 group-hover:shadow-xl"
        >
          <ElImage
            :src="item.value"
            :alt="item.name"
            fit="contain"
            class="h-full w-full cursor-pointer p-4 transition-transform duration-200 hover:scale-[1.02]"
          />
        </div>
        <span
          class="mt-3 font-medium text-gray-600 transition-colors duration-200 group-hover:text-blue-600"
          >{{ item.name }}</span
        >
      </div>
    </div>

    <!-- 感谢语 -->
    <div class="mt-4 text-center text-blue-500 italic">感谢您的支持！</div>
  </div>
</template>

<script setup>
// 导入支付图片
import aliPay from '@/assets/images/aliPay.jpg'
import weChatPay from '@/assets/images/weChatPay.jpg'
import { ElImage } from 'element-plus'

// 支付方式列表
const list = [
  { name: '支付宝', value: aliPay },
  { name: '微信支付', value: weChatPay },
]
</script>

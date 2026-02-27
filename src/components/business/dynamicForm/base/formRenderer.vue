<template>
  <VueDraggable
    v-model="items"
    :animation="150"
    tag="el-row"
    :gutter="20"
    class="m-0! w-full border border-solid border-gray-300"
    :style="{ backgroundColor: getBackgroundColor(level) }"
    :disabled="!draggable"
  >
    <el-col
      v-for="(item, index) in validatedItems"
      :key="item.id"
      :span="item.span || defaultSpan"
      class="w-full p-0!"
    >
      <!-- 校验通过：渲染表单项 -->
      <FormItem v-if="item.isValid" :form="item" label-position="top">
        <template v-if="item.children?.length">
          <!-- 容器组件包裹 -->
          <component
            v-if="item.component"
            :is="getComponent(item.component)"
            v-bind="item.props || {}"
          >
            <FormRenderer
              v-model:items="items[index].children"
              :level="level + 1"
              :draggable="draggable"
              :default-span="defaultSpan"
            />
          </component>
          <!-- 纯逻辑分组 -->
          <FormRenderer
            v-else
            v-model:items="items[index].children"
            :level="level + 1"
            :draggable="draggable"
            :default-span="defaultSpan"
          />
        </template>
        <!-- 叶子节点 -->
        <template v-else>
          <ContainerObject v-if="item.type === 'object'" :form="item" />
          <ContainerArray v-else-if="item.type === 'array'" :form="item" />
        </template>
      </FormItem>

      <!-- 校验失败：展示友好的错误提示 -->
      <FormError v-else :error-msg="item.errorMsg" :raw="item.raw" />
    </el-col>
  </VueDraggable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { checkForm } from '../code/checkForm'
import { getComponent } from '../components'
import ContainerArray from './containerArray.vue'
import ContainerObject from './containerObject.vue'
import FormError from './formError.vue'
import FormItem from './formItem.vue'
defineOptions({ name: 'FormRenderer' })

withDefaults(
  defineProps<{
    level?: number
    draggable?: boolean
    defaultSpan?: number
  }>(),
  {
    level: 0,
    draggable: false,
    defaultSpan: 24,
  },
)
const items = defineModel<any[]>('items', {
  default: () => [],
})
/**
 * 预处理数据：计算校验结果，避免模板中多次调用函数
 */
const validatedItems = computed(() => {
  return items.value.map((item, index) => {
    const checkResult = checkForm(item)
    return {
      ...item,
      id: item.id || `renderer-item-${index}`,
      isValid: checkResult === true,
      errorMsg: typeof checkResult === 'string' ? checkResult : '',
      raw: item, // 保留原始数据用于错误展示
    }
  })
})

// 预定义一组背景色，按层级循环使用
const backgroundColors = [
  '#', // 0层：白色
  '#f0f9eb', // 1层 : 浅绿
  '#ecf5ff', // 2层 : 浅蓝
  '#fdf6ec', // 3层 : 浅橙
  '#fef0f0', // 4层 : 浅红
]

function getBackgroundColor(level: number) {
  return backgroundColors[level % backgroundColors.length]
}
</script>

<style scoped></style>

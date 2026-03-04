<!-- eslint-disable vue/valid-v-model -->
<template>
  <VueDraggable
    v-model="items"
    :animation="150"
    tag="el-row"
    class="m-0! w-full"
    :style="
      !isSlot
        ? {
            border: `1px solid ${getBackgroundColor(level)}`,
          }
        : {}
    "
    :disabled="!draggable"
  >
    <el-row :gutter="12">
      <template v-for="(item, index) in items" :key="item.id">
        <el-col :span="getSpan(item.span)" :class="{ 'mb-3': !isLastRow(index) }">
          <!-- 校验通过：渲染表单项 -->
          <FormItem v-if="checkForm(item)" :form="item" label-position="top">
            <template v-if="item.children?.length">
              <!-- 容器组件包裹 -->
              <component
                v-if="item.component"
                :is="getComponent(item.component)"
                v-bind="item.props"
              >
                <template #[getSlot(item.slot)]>
                  <FormRenderer
                    v-model:items="item.children"
                    :level="level + 1"
                    :draggable="draggable"
                    :default-span="defaultSpan"
                    :is-slot="true"
                  />
                </template>
              </component>
              <!-- 纯逻辑分组 -->
              <FormRenderer
                v-else
                v-model:items="item.children"
                :level="level + 1"
                :draggable="draggable"
                :default-span="defaultSpan"
                :is-slot="true"
              />
            </template>
            <!-- 叶子节点 -->
            <component
              v-else
              :is="item.type === 'object' ? ContainerObject : ContainerArray"
              :form="item"
              @update:form="updateItem(index, $event)"
            />
          </FormItem>
          <!-- 校验失败：展示友好的错误提示 -->
          <FormError v-else :error-msg="item.errorMsg" :raw="item.raw" />
        </el-col>
      </template>
    </el-row>
  </VueDraggable>
</template>

<script setup lang="ts">
import { isString } from '@/utils'
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { checkForm } from '../code/checkForm'
import { getComponent } from '../components'
import ContainerArray from './containerArray.vue'
import ContainerObject from './containerObject.vue'
import FormError from './formError.vue'
import FormItem from './formItem.vue'
defineOptions({ name: 'FormRenderer' })

const props = withDefaults(
  defineProps<{
    level?: number
    draggable?: boolean
    defaultSpan?: number
    isSlot?: boolean
  }>(),
  {
    level: 0,
    draggable: false,
    defaultSpan: 24,
    isSlot: false,
  },
)
// 处理插槽名称
function getSlot(slot: string | undefined) {
  if (slot && isString(slot)) {
    return slot
  }
  return 'default'
}
// 处理span值
const getSpan = (span: number | string | undefined) => {
  // 转换为数字
  const num = Number(span)
  // 无效值返回默认值
  if (isNaN(num)) return props.defaultSpan
  // 小于1返回默认值
  if (num < 1) return props.defaultSpan
  // 超出范围则取最大24
  if (num > 24) return 24
  return num
}
const items = defineModel<any[]>('items', {
  default: () => [],
})

/**
 * 更新指定索引的表单项数据
 */
const updateItem = (index: number, newForm: any) => {
  if (items.value[index]) {
    items.value[index] = { ...items.value[index], ...newForm }
  }
}
/**
 * 预处理数据：计算校验结果，避免模板中多次调用函数
 */
const validatedItems = computed(() => {
  // 过滤禁用项
  const list = items.value.filter((item) => !item?.disable)

  return list.map((item, index) => {
    const checkResult = checkForm(item)
    return {
      ...item,
      id: item.id || `renderer-item-${index}`,
      isValid: checkResult === true,
      errorMsg: typeof checkResult === 'string' ? checkResult : '',
      raw: item, // 保留原始数据用于错误展示
      // slot
      _slot: getSlot(item?.slot),
      // 转换span为数字
      _span: getSpan(item?.span),
    }
  })
})

// 预定义一组背景色，按层级循环使用
const backgroundColors = [
  '#ffffff', // 0层：白色
  '#f0f9eb', // 1层 : 浅绿
  '#ecf5ff', // 2层 : 浅蓝
  '#fdf6ec', // 3层 : 浅橙
  '#fef0f0', // 4层 : 浅红
]

function getBackgroundColor(level: number) {
  return backgroundColors[level % backgroundColors.length]
}

/**
 * 判断是否为最后一排
 */
const lastRowIndices = computed(() => {
  let currentRowSpan = 0
  let currentRowIndices: number[] = []

  validatedItems.value.forEach((item, index) => {
    const span = item._span
    // 如果当前行加上这个项超过 24，则开启新的一行
    if (currentRowSpan + span > 24) {
      currentRowIndices = [index]
      currentRowSpan = span
    } else {
      currentRowIndices.push(index)
      currentRowSpan += span
    }
  })
  return currentRowIndices
})

const isLastRow = (index: number) => {
  return lastRowIndices.value.includes(index)
}
</script>

<style scoped></style>

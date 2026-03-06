<template>
  <el-row ref="row" :gutter="12">
    <FormItem :form="item" v-for="item in items.fields" :key="item.id">
      <!-- 校验失败：展示友好的错误提示 -->
      <FormError v-if="!checkForm(item)" :error-msg="item.errorMsg" :raw="item.raw" />
      <!-- 校验通过：渲染表单项 -->
      <template v-if="item.children">
        <!-- 容器组件包裹 -->
        <component
          v-if="item.component && getSlot(item.slot)"
          :is="getComponent(item.component)"
          v-bind="item.props"
        >
          <template #[getSlot(item.slot)]>
            {{ items.children }}
            <FormRenderer v-model:items="item.children" />
          </template>
        </component>
        <!-- 纯逻辑分组 -->
        <FormRenderer v-else v-model:items="item.children" />
      </template>
      <!-- 叶子节点 -->
      <component
        v-else
        :is="item.type === 'object' ? ContainerObject : ContainerArray"
        :form="item"
      />
    </FormItem>
  </el-row>
</template>

<script setup lang="ts">
import { isString } from '@/utils'
import { useDraggable } from 'vue-draggable-plus'
import { checkForm } from '../code/checkForm'
import { getComponent } from '../components'
import ContainerArray from './containerArray.vue'
import ContainerObject from './containerObject.vue'
import FormError from './formError.vue'
import FormItem from './formItem.vue'
defineOptions({ name: 'FormRenderer' })

const row: any = useTemplateRef('row')

// 处理插槽名称
function getSlot(slot: string | boolean | undefined) {
  if (typeof slot == 'boolean' && slot === true) {
    return 'default'
  }
  if (isString(slot) && slot.length) {
    return slot
  }
  return false
}

const items = defineModel<any>('items', {})
// /**
//  * 判断是否为最后一排
//  */
// const lastRowIndices = computed(() => {
//   let currentRowSpan = 0
//   let currentRowIndices: number[] = []

//   validatedItems.value.forEach((item, index) => {
//     const span = item._span
//     // 如果当前行加上这个项超过 24，则开启新的一行
//     if (currentRowSpan + span > 24) {
//       currentRowIndices = [index]
//       currentRowSpan = span
//     } else {
//       currentRowIndices.push(index)
//       currentRowSpan += span
//     }
//   })
//   return currentRowIndices
// })
useDraggable(row, items.value.fields, {
  animation: 150,
  ghostClass: 'ghost',
  handle: items.value?.dragClass || '',
  disabled: !items.value?.drag,
  onEnd(data: any) {
    const { oldIndex, newIndex } = data
    if (oldIndex === newIndex) return
    const [item] = items.value.fields.splice(oldIndex, 1)
    items.value.fields.splice(newIndex, 0, item)
  },
})
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>

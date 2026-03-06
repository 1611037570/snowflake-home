<template>
  <el-row ref="row" :gutter="12" :key="items.id" v-if="init">
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
import { getUUID, isString } from '@/utils'
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
const init = ref(false)
onMounted(async () => {
  if (!items.value.id) {
    items.value.id = getUUID()
  }
  watch(
    items.value.fields,
    () => {
      items.value.fields.map((item: any) => {
        return {
          ...item,
          id: item.id || getUUID(),
        }
      })
    },
    {
      immediate: true,
      deep: true,
    },
  )

  init.value = true
  await nextTick()
  useDraggable(row, items.value.fields, {
    animation: 150,
    ghostClass: 'ghost',
    handle: items.value?.dragClass || '',
    disabled: !items.value?.drag,
  })
})

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
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>

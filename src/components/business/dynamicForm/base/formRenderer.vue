<template>
  <el-row ref="row" :gutter="12" :key="items.id" v-if="init">
    <FormItem :currentForm="item" v-for="(item, index) in items.fields" :key="item.id">
      <!-- 校验失败：展示友好的错误提示 -->
      <FormError v-if="!checkForm(item)" :error-msg="item.errorMsg" :raw="item.raw" />
      <!-- v-bind="$attrs" -->
      <Container
        :currentForm="item"
        v-else-if="item.slot"
        :currentIndex="index"
        @removeObject="removeObject"
      />
      <component
        v-else
        :is="item.type === 'object' ? ContainerObject : ContainerArray"
        :currentForm="item"
        :currentIndex="index"
        @removeObject="removeObject"
        @removeItem="removeItem"
      />
    </FormItem>
  </el-row>
</template>

<script setup lang="ts">
import { getUUID } from '@/utils'
import { useDraggable } from 'vue-draggable-plus'
import { checkForm } from '../code/checkForm'
import Container from './container.vue'
import ContainerArray from './containerArray.vue'
import ContainerObject from './containerObject.vue'
import FormError from './formError.vue'
import FormItem from './formItem.vue'

defineOptions({ name: 'FormRenderer' })
const rootData = inject<any>('df/root/data')
const row: any = useTemplateRef('row')
// 表单数据
const items = defineModel<any>('items', {})
const init = ref(false)
// 拖拽实例
let draggable: ReturnType<typeof useDraggable> | null = null

// 移除对象
function removeObject(index: number) {
  rootData.removeObject(items.value.fields[index])
  items.value.fields.splice(index, 1)
}
// 移除数组项
function removeItem(index: number) {
  rootData.removeItem(items.value.list[index])
  items.value.list.splice(index, 1)
}

function ensureFieldIds(fields: any[]) {
  if (!fields) return
  fields.forEach((item: any) => {
    if (!item.id) {
      item.id = getUUID()
    }
  })
}
onMounted(async () => {
  await nextTick()
  if (!items.value.id) {
    items.value.id = getUUID()
  }
  ensureFieldIds(items.value.fields)
  watch(
    () => [items.value?.fields, items.value?.fields?.length],
    () => {
      ensureFieldIds(items.value?.fields)
    },
  )

  init.value = true

  if (!items.value?.drag) {
    return
  }
  // 初始化拖拽
  draggable = useDraggable(row, items.value.fields, {
    animation: 150,
    ghostClass: 'ghost',
    handle: items.value?.dragClass || '',
  })
})
onUnmounted(() => {
  draggable?.destroy()
  draggable = null
})
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>

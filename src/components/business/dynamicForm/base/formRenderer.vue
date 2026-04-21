<template>
  <el-row ref="row" :gutter="12" :key="items.id" v-if="init">
    <FormItem :form="item" v-for="(item, index) in items.fields" :key="item.id">
      <!-- 校验失败：展示友好的错误提示 -->
      <FormError v-if="!checkForm(item)" :error-msg="item.errorMsg" :raw="item.raw" />
      <!-- v-bind="$attrs" -->
      <Container
        :form="item"
        v-else-if="item.slot"
        :currentIndex="index"
        @removeObject="removeObject"
      />
      <component
        v-else
        :is="item.type === 'object' ? ContainerObject : ContainerArray"
        :form="item"
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

function removeObject(index: number) {
  rootData.removeObject(items.value.fields[index])
  items.value.fields.splice(index, 1)
}
function removeItem(index: number) {
  rootData.removeItem(items.value.list[index])
  items.value.list.splice(index, 1)
}
const row: any = useTemplateRef('row')

const items = defineModel<any>('items', {})
const init = ref(false)
let draggable: ReturnType<typeof useDraggable> | null = null
onMounted(async () => {
  await nextTick()
  if (!items.value.id) {
    items.value.id = getUUID()
  }
  // 监听 fields 变化，为每个 item 生成 id
  watch(
    items.value.fields,
    (newV) => {
      if (!newV) return
      newV.forEach((item: any) => {
        if (!item.id) {
          item.id = getUUID()
        }
      })
    },
    {
      immediate: true,
      deep: true,
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

<template>
  <el-row ref="row" :gutter="12" :key="items.id" v-if="init">
    <FormItem :form="item" v-for="(item, index) in items.fields" :key="item.id">
      <!-- 校验失败：展示友好的错误提示 -->
      <FormError v-if="!checkForm(item)" :error-msg="item.errorMsg" :raw="item.raw" />
      <Container
        :form="item"
        v-if="item.type === 'container'"
        :currentIndex="index"
        @remove="remove"
      />
      <component
        v-else
        :is="item.type === 'object' ? ContainerObject : ContainerArray"
        :form="item"
        :currentIndex="index"
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

function remove(index: number) {
  rootData.objectRemove(items.value.fields[index])
  items.value.fields.splice(index, 1)
  return
}
const row: any = useTemplateRef('row')

const items = defineModel<any>('items', {})
const init = ref(false)
onMounted(async () => {
  await nextTick()
  if (!items.value.id) {
    items.value.id = getUUID()
  }
  // 监听 fields 变化，为每个 item 生成 id
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

  // 初始化拖拽
  useDraggable(row, items.value.fields, {
    animation: 150,
    ghostClass: 'ghost',
    handle: items.value?.dragClass || '',
    disabled: !items.value?.drag,
  })
})
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>

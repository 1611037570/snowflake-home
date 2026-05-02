<script setup>
import { getUUID } from '@/utils'

const { proxy } = getCurrentInstance()

const props = defineProps({
  title: {
    type: String,
    default: '未填写',
  },
  add: {
    type: Boolean,
    default: true,
  },
})
const currentForm = inject('df/current/form')
const objectRemove = inject('df/remove')
const rootData = inject('df/root/data')

function del() {
  proxy.$confirm(`确定要删除${props.title}模块吗？`, '删除确认').then(() => {
    objectRemove()
  })
}
function handleAdd() {
  /**
   * 错误的写法，原则上应该通过 inject('df/add')
   * 但是数据是绑定在list上的，如果通过list会有空数组未渲染的情况，如果新增组件，又得处理不需要拖拽的元素
   * 所以直接偷懒了
   */
  const currentFields = currentForm.value.fields[0]
  const { addConfig, list } = currentFields
  if (!addConfig) {
    console.log('addConfig:>> ', addConfig)
    return
  }
  rootData.getDataProxy(addConfig.model, list.length)

  list.push({
    ...addConfig,
    id: getUUID(),
  })
}
</script>

<template>
  <SfCollapse>
    <SfCollapseItem>
      <template #title>
        <div class="flex h-full w-full items-center justify-between">
          <div class="flex items-center text-lg font-bold">
            <SfIcon
              icon="icon-park:drag"
              size="4"
              class="container-drag mr-1 cursor-move!"
              @click.stop=""
            />
            {{ title }}
          </div>
          <SfIcon
            @click.stop="del"
            icon="ic:round-delete"
            size="4"
            class="mr-3 hover:text-sf-theme"
          />
        </div>
      </template>
      <template #default>
        <slot />
        <div
          class="flex cursor-pointer items-center gap-1 text-sf-theme"
          @click="handleAdd"
          v-if="add"
        >
          <SfIcon icon="ic:round-add" size="4" />
          <span> 增加{{ title }} </span>
        </div>
      </template>
    </SfCollapseItem>
  </SfCollapse>
</template>

<style lang="scss" scoped></style>

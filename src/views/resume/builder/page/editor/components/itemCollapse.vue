<script setup>
const { proxy } = getCurrentInstance()
const props = defineProps({
  title: {
    type: String,
    default: '未填写',
  },
  index: {},
  add: {},
  containerTitle: {},
})
const removeItem = inject('df/removeItem')
const length = inject('df/current/length')

function del() {
  proxy
    .$confirm('确定要删除当前内容吗？', '删除确认', {
      confirmText: '确定删除',
      cancelText: '取消操作',
    })
    .then(() => {
      removeItem(props.index)
    })
}
const addFn = inject('df/add')
function handleAdd() {
  addFn()
}
</script>

<template>
  <SfCollapse>
    <SfCollapseItem>
      <template #title>
        <div class="flex h-full w-full items-center justify-between">
          <div class="flex items-center">
            <SfIcon icon="icon-park:drag" size="4" class="item-drag mr-1 cursor-move!" />
            {{ title }}
          </div>
          <SfIcon
            @click.stop="del"
            icon="material-symbols:delete-outline"
            size="4"
            class="mr-3 hover:text-sf-theme"
          />
        </div>
      </template>
      <template #default>
        <slot />
      </template>
    </SfCollapseItem>
  </SfCollapse>
  <div
    class="flex cursor-pointer items-center gap-1 text-sf-theme"
    @click="handleAdd"
    v-if="length - 1 == index && add"
  >
    <SfIcon icon="ic:round-add" size="4" />
    <span> 增加{{ containerTitle }} </span>
  </div>
</template>

<style lang="scss" scoped></style>

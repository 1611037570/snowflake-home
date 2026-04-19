<script setup>
const { proxy } = getCurrentInstance()

defineProps({
  title: {
    type: String,
    default: '未填写',
  },
  add: {
    type: Boolean,
    default: true,
  },
  addConfig: {
    type: Object,
    default: () => {},
  },
})
// const currentForm = inject('df/current/form')
const objectRemove = inject('df/remove')

function del() {
  proxy
    .$confirm('确定要删除当前内容吗？', '删除确认', {
      confirmText: '确定删除',
      cancelText: '取消操作',
    })
    .then(() => {
      objectRemove()
    })
}
</script>

<template>
  <SfCollapse>
    <SfCollapseItem>
      <template #title>
        <div class="flex h-full w-full items-center justify-between">
          <div class="flex items-center text-lg font-bold">
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
        <slot :add="add" :containerTitle="title" />
      </template>
    </SfCollapseItem>
  </SfCollapse>
</template>

<style lang="scss" scoped></style>

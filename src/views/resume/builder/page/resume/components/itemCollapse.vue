<script setup>
defineProps({
  title: {
    type: String,
    default: '未填写',
  },
})
function del() {}
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
            @click="del"
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
</template>

<style lang="scss" scoped></style>

<script setup>
const { proxy } = getCurrentInstance();
const props = defineProps({
  title: {
    type: String,
    default: "未填写",
  },
  index: {},
});
const { removeItem } = inject("df/context");

function del() {
  proxy.$confirm(`确定要删除${props.title}吗？`, "删除确认").then(() => {
    removeItem(props.index);
  });
}
</script>

<template>
  <SfCollapse :border="false">
    <SfCollapseItem>
      <template #title>
        <div class="group flex h-full w-full items-center justify-between text-sf-text">
          <div class="flex items-center">
            <SfIcon
              icon="icon-park-outline:drag"
              size="4"
              class="item-drag mr-1 cursor-move!"
              @click.stop=""
            />
            {{ title }}
          </div>
          <SfIcon
            @click.stop="del"
            icon="ic:round-delete"
            size="4"
            class="mr-3 opacity-0 group-hover:opacity-100 hover:text-sf-theme"
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

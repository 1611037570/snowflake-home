<script setup>
const { proxy } = getCurrentInstance();
const props = defineProps({
  index: {},
});
const name = defineModel("name", {
  type: String,
  default: "",
});
const { currentIndex, removeItem } = inject("df/context")();

// 标题：统一走 name 数据源，空值占位符兜底
const displayTitle = computed(() => name.value || "尚未填写");

// 删除索引：兼容显式传入与容器注入两种来源
const delIndex = computed(() => props.index ?? currentIndex?.value);

function del() {
  proxy.$confirm(`确定要删除${name.value}吗？`, "删除确认").then(() => {
    removeItem(delIndex.value);
  });
}
</script>

<template>
  <SfCollapse :border="false">
    <SfCollapseItem>
      <template #title>
        <div class="group flex h-full w-full items-center justify-between text-sf-text">
          <div class="flex items-center text-[15px] font-bold">
            <SfIcon
              icon="icon-park-outline:drag"
              size="4"
              class="item-drag mr-1 cursor-move!"
              @click.stop=""
            />
            {{ displayTitle }}
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

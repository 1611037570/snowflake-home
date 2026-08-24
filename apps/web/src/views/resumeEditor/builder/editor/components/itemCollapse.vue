<script setup>
const { proxy } = getCurrentInstance();
const props = defineProps({
  title: {
    type: String,
    default: "未填写",
  },
  index: {},
  placeholder: {
    type: String,
    default: "未填写",
  },
});
const name = defineModel("name", {
  type: String,
  default: "",
});
const { currentIndex, removeItem } = inject("df/context")();

// 标题：显式传入优先，其次按标题字段数据推导，最后占位符兜底
const displayTitle = computed(() => {
  if (props.title && props.title !== "未填写") return props.title;
  return name.value || props.placeholder;
});

// 删除索引：兼容显式传入与容器注入两种来源
const delIndex = computed(() => props.index ?? currentIndex?.value);

function del() {
  proxy.$confirm(`确定要删除${displayTitle.value}吗？`, "删除确认").then(() => {
    removeItem(delIndex.value);
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

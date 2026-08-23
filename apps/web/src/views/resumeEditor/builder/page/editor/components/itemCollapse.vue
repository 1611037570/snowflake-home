<script setup>
import { DF_REMOVE_ITEM } from "@/components/business/dynamicForm/code/injectionKeys";
const { proxy } = getCurrentInstance();
const props = defineProps({
  title: {
    type: String,
    default: "未填写",
  },
  index: {},
});
const removeItem = inject(DF_REMOVE_ITEM);

function del() {
  proxy.$confirm(`确定要删除${props.title}吗？`, "删除确认").then(() => {
    removeItem(props.index);
  });
}
</script>

<template>
  <SfCollapse>
    <SfCollapseItem>
      <template #title>
        <div class="flex h-full w-full items-center justify-between text-sf-text">
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

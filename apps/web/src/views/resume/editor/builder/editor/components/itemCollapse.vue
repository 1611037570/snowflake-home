<script setup>
import { EXPANDED } from "@/stores/modules/resume/formConfig";
import Icon from "../icon.vue";

const { proxy } = getCurrentInstance();
// 记录折叠状态：复用展开常量，随记录数据持久化
const collapsed = defineModel("collapsed", {
  type: Array,
  default: () => EXPANDED,
});
const name = defineModel("name", {
  type: String,
  default: "",
});
// 当前经历项的隐藏状态
const hidden = defineModel("hidden", {
  type: Boolean,
  default: false,
});
const { removeCurrent } = inject("df/context")();

// 标题：统一走 name 数据源，空值占位符兜底
const displayTitle = computed(() => name.value || "尚未填写");

function del() {
  proxy.$confirm(`确定要删除${name.value}吗？`, "删除确认").then(() => {
    removeCurrent();
  });
}
</script>

<template>
  <SfCollapse v-model="collapsed" :border="false">
    <SfCollapseItem name="1">
      <template #title>
        <div class="group flex h-full w-full items-center justify-between text-sf-text">
          <div class="flex flex-1 items-center text-[15px] font-bold">
            <Icon icon="icon-park-outline:drag" class="item-drag cursor-move!" />
            {{ displayTitle }}
          </div>
          <div
            class="flex items-center opacity-0 transition-all duration-300 group-hover:opacity-100"
          >
            <Icon :icon="hidden ? 'lucide:eye' : 'lucide:eye-off'" @click.stop="hidden = !hidden" />
            <Icon @click.stop="del" icon="ic:round-delete" />
          </div>
        </div>
      </template>
      <template #default>
        <slot />
      </template>
    </SfCollapseItem>
  </SfCollapse>
</template>

<style lang="scss" scoped></style>

<template>
  <Component
    :is="h(ElFormItem, { ...$attrs, ref: changeRef }, $slots)"
    :label-position="labelPosition"
    class="w-full"
  >
    <template #label v-if="label && labelPosition === 'top'">
      <div class="mb-1 flex h-5 w-full items-center text-sf-base" @click.stop="">
        <!-- 可拖拽字段显示拖拽手柄 -->
        <SfIcon
          v-if="drag"
          icon="icon-park-outline:drag"
          size="4"
          class="item-drag mr-1 cursor-move!"
          @click.stop=""
        />
        <span class="pr-1 pl-2 text-[15px] text-sf-text">
          {{ label }}
        </span>
        <sf-tooltip :content="tip" v-if="tip" class="text-sf-text" />
      </div>
    </template>
    <slot />
  </Component>
</template>

<script setup lang="ts">
import { ElFormItem } from "element-plus";
import type { ComponentInstance } from "vue";
import { getCurrentInstance, h } from "vue";

defineOptions({ name: "SfFormItem" });
defineProps({
  label: {
    type: String,
    default: "",
  },
  tip: {
    type: String,
    default: "",
  },
  labelPosition: {
    type: String,
    default: "top",
  },
  drag: {
    type: Boolean,
    default: false,
  },
});
const vm: any = getCurrentInstance();

function changeRef(exports: any) {
  vm.exposed = exports;
}
defineExpose({} as ComponentInstance<typeof ElFormItem>);
</script>

<style scoped>
.el-form-item__label {
  display: flex !important;
}
:deep(.el-form-item__label) {
  display: flex !important;
  align-items: center;
}
</style>

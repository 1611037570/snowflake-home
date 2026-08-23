<template>
  <Component
    :is="h(ElFormItem, { ...$attrs, ref: changeRef }, $slots)"
    :label-position="labelPosition"
    class="w-full"
  >
    <template #label v-if="label && labelPosition === 'top'">
      <div class="mb-1 flex h-5 w-full items-center font-bold text-sf-base" @click.stop="">
        <span class="pr-1 pl-2 text-sf-text">
          {{ label }}
        </span>
        <sf-tooltip :content="tipContent" v-if="tip" class="text-sf-text" />
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
  tip: {
    type: Boolean,
    default: false,
  },
  tipContent: {
    type: String,
    default: "",
  },
});
const vm: any = getCurrentInstance();

function changeRef(exports: any) {
  vm.exposed = exports;
}
defineExpose({} as ComponentInstance<typeof ElFormItem>);
</script>

<style scoped></style>

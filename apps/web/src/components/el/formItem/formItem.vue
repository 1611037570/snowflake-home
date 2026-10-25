<template>
  <!-- 表单项只阻止点击继续冒泡，不取消输入控件在移动端的默认聚焦。 -->
  <Component
    :is="h(ElFormItem, { ...$attrs, ref: changeRef }, $slots)"
    :label-position="labelPosition"
    class="w-full"
    @click.stop=""
  >
    <template #label v-if="label && labelPosition === 'top'">
      <slot name="label">
        <!-- 只隔离点击冒泡，保留移动端表单控件的默认聚焦。 -->
        <div class="mb-1 flex h-5 w-full items-center text-sf-base" @click.stop="">
          <div class="flex flex-1 items-center">
            <span class="pr-1 pl-2 text-[15px] text-sf-text">
              {{ label }}
            </span>
            <sf-tooltip :content="tip" v-if="tip" class="text-sf-text" />
          </div>
        </div>
      </slot>
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

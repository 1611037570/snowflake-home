<template>
  <!-- 分组无包裹组件：纯栅格渲染子字段 -->
  <FormRenderer
    v-if="!currentForm.component"
    v-model:items="currentForm"
    :pathContext="pathContext"
  />
  <!-- 分组有包裹组件：渲染组件并在槽内递归渲染子字段 -->
  <component
    v-else
    :is="getComponent(currentForm.component)"
    v-bind="{
      ...rootData.getDataProxy(currentForm.model, pathContext),
      ...currentForm.props,
    }"
    v-on="bindEvent"
  >
    <template #[slotName]>
      <!-- 递归渲染时显式下传当前数组记录上下文 -->
      <FormRenderer v-model:items="currentForm" :pathContext="pathContext" />
    </template>
  </component>
</template>

<script setup lang="ts">
import { isString } from "@/utils";
import type { DataPathContext } from "../code/pathContext";
import {
  DF_CURRENT_FORM,
  DF_CURRENT_PATH_CONTEXT,
  DF_CURRENT_TYPE,
  DF_REMOVE,
  DF_ROOT_DATA,
} from "../code/injectionKeys.ts";
import { getComponent } from "../code/getComponent.ts";
import FormRenderer from "./formRenderer.vue";

const currentForm = defineModel<any>("currentForm");
const { pathContext } = defineProps<{
  pathContext?: DataPathContext;
}>();

// 处理插槽名称
const slotName = computed(() => {
  const slot = currentForm.value?.slot;
  return isString(slot) && slot.length ? slot : "default";
});
const rootData: any = inject(DF_ROOT_DATA);
const bindEvent = computed(() => {
  return rootData.setDataProxy(currentForm.value.model, pathContext);
});
const emit = defineEmits(["removeObject"]);
function remove() {
  emit("removeObject");
}
// 提供当前容器的表单数据
provide(DF_CURRENT_FORM, currentForm);
// 提供当前数组记录路径，供业务组件调用引擎能力时解析相对字段
provide(
  DF_CURRENT_PATH_CONTEXT,
  computed(() => pathContext),
);
// 提供删除方法
provide(DF_REMOVE, remove);
// 提供当前容器的类型
provide(DF_CURRENT_TYPE, "container");
</script>

<style scoped></style>

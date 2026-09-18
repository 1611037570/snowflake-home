<template>
  <!-- 分组无包裹组件：纯栅格渲染子字段 -->
  <FormRenderer
    v-if="!currentForm.component"
    v-model:items="currentForm"
    :pathContext="pathContext"
    :class="currentForm.rowClass"
  />
  <!-- 分组有包裹组件：渲染组件并在槽内递归渲染子字段 -->
  <component
    v-else
    :is="getComponent(currentForm.component)"
    v-bind="{
      ...(currentForm.model ? rootData.getDataProxy(currentForm.model, pathContext) : {}),
      ...currentForm.props,
    }"
    v-on="bindEvent"
  >
    <template #[slotName]>
      <!-- 递归渲染时显式下传当前数组记录上下文 -->
      <FormRenderer
        v-model:items="currentForm"
        :pathContext="pathContext"
        :class="currentForm.rowClass"
      />
    </template>
  </component>
</template>

<script setup lang="ts">
import { isString } from "@/utils";
import type { DataPathContext } from "../code/pathContext";
import { DF_ROOT_DATA } from "../code/injectionKeys.ts";
import { getComponent } from "../code/getComponent.ts";
import { provideContainerContext } from "../code/provideContainerContext";
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
// 容器未声明 model 时不建立数据代理，仅透传配置
const bindEvent = computed(() => {
  if (!currentForm.value?.model) return {};
  return rootData.setDataProxy(currentForm.value.model, pathContext);
});
const emit = defineEmits(["removeObject"]);
function remove() {
  emit("removeObject");
}
// 统一提供容器上下文：类型、表单配置、路径与删除能力
provideContainerContext({
  type: "container",
  form: currentForm,
  pathContext: () => pathContext,
  remove,
});
</script>

<style scoped></style>

<template>
  <component
    :is="component"
    v-bind="{
      ...rootData.getDataProxy(currentForm.model, currentIndex),
      ...currentForm.props,
      // ...$attrs,
    }"
    v-on="bindEvent"
  ></component>
</template>

<script setup lang="ts">
import { inject, toRef } from "vue";
import { getComponent } from "../components";

const props = defineProps<{
  currentIndex?: any;
  currentForm: any;
}>();

const bindEvent = computed(() => {
  return rootData.setDataProxy(props.currentForm.model, props.currentIndex);
});
const rootData = inject<any>("df/root/data");

const component = computed(() => getComponent(props.currentForm?.component));
const emit = defineEmits(["removeObject"]);

function remove() {
  emit("removeObject", props.currentIndex);
}
// 提供当前容器的索引
provide("df/current/index", toRef(props, "currentIndex"));
// 提供当前容器的表单数据（统一提供 ref，与 container/containerArray 保持一致）
provide("df/current/form", toRef(props, "currentForm"));
// 提供当前容器的类型
provide("df/current/type", "object");
// 提供删除方法
provide("df/remove", remove);
</script>

<style scoped></style>

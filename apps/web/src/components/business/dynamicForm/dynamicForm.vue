<template>
  <el-form ref="dynamicForm" :model="data" label-width="auto" class="flex w-full flex-col">
    <FormRenderer v-model:items="formProxy" />
  </el-form>
</template>
<script setup lang="ts">
import { getCurrentInstance, provide } from "vue";
import FormRenderer from "./base/formRenderer.vue";
import DataProxy from "./code/dataProxy";
// import useFormProxy from './code/useFormProxy'

defineOptions({ name: "SfDynamicForm" });
type DynamicFormProps = {
  components?: Record<string, any>;
};
const props = withDefaults(defineProps<DynamicFormProps>(), {
  components: () => ({}),
});

const instance = getCurrentInstance();
const emit = instance?.emit;
// 定义表单模型
const form = defineModel<any>("form");
// 定义数据模型
const data = defineModel<any>("data");
const dataProxy = new DataProxy(data, emit);
// const formProxy = useFormProxy(form)
const formProxy = ref(form);

// 注入实例组件库
provide("instanceComponents", props.components);
// 注入根数据
provide("df/root/data", dataProxy);
// 注入根表单
provide("df/root/form", formProxy);
</script>

<style scoped></style>

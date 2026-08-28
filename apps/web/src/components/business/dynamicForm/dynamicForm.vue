<template>
  <el-form ref="dynamicForm" :model="data" label-width="auto" class="flex w-full flex-col">
    <FormRenderer v-model:items="formProxy" />
  </el-form>
</template>
<script setup lang="ts">
import { getCurrentInstance, inject, provide } from "vue";
import eventBus from "@/utils/modules/eventBus";
import FormRenderer from "./components/formRenderer.vue";
import DataProxy from "./code/dataProxy";
import { createAddItem } from "./code/addItem";
import {
  DF_CONTEXT,
  DF_CURRENT_FORM,
  DF_CURRENT_INDEX,
  DF_CURRENT_LENGTH,
  DF_CURRENT_TYPE,
  DF_MODULE_SELECT,
  DF_REMOVE,
  DF_REMOVE_ITEM,
  DF_ROOT_DATA,
  DF_ROOT_FORM,
  INSTANCE_COMPONENTS,
} from "./code/injectionKeys";
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
provide(INSTANCE_COMPONENTS, props.components);
// 注入根数据
provide(DF_ROOT_DATA, dataProxy);
// 注入根表单
provide(DF_ROOT_FORM, formProxy);

// 模块选中能力：外部调用 selectModule(key) 触发选中，选中后模块边框持续闪烁，鼠标经过恢复
const selectedKey = ref<string | null>(null);
const selectModule = (key: string | null) => {
  selectedKey.value = key;
};
provide(DF_MODULE_SELECT, { selectedKey, selectModule });
// 监听全局事件：外部（如完成度"去填写"）触发选中模块时联动边框闪烁
onMounted(() => {
  eventBus.on("df-select-module", selectModule);
});
onUnmounted(() => {
  eventBus.off("df-select-module", selectModule);
});

// 对外上下文读取器：根组件统一提供，业务组件调用时基于自身实例解析最近容器的能力，无需容器聚合
const getContext = () => ({
  currentForm: inject(DF_CURRENT_FORM),
  currentIndex: inject(DF_CURRENT_INDEX),
  currentType: inject(DF_CURRENT_TYPE),
  currentLength: inject(DF_CURRENT_LENGTH),
  removeSelf: inject(DF_REMOVE),
  removeItem: inject(DF_REMOVE_ITEM),
  addItem: createAddItem(inject(DF_CURRENT_FORM)),
});
// 注入对外上下文契约
provide(DF_CONTEXT, getContext);
</script>

<style scoped></style>

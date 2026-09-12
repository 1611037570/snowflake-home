<template>
  <el-row ref="row" :class="{ 'drag-container-active': isDragging }" :gutter="12" :key="items.id">
    <FormItem
      :currentForm="item.field"
      :data-module-key="item.field.key"
      :data-fixed="item.field.fixed ? 'true' : undefined"
      v-for="item in renderFields"
      :key="item.field.id"
      :pathContext="pathContext"
      :selected="isModuleSelected(item.field)"
      @mouseenter="handleModuleMouseEnter(item.field)"
      @remove="removeField(item.field)"
    >
      <!-- 校验失败：展示友好的错误提示 -->
      <FormError
        v-if="!checkForm(item.field)"
        :error-msg="item.field.errorMsg"
        :raw="item.field.raw"
      />
      <!-- v-bind="$attrs" -->
      <ContainerSlot
        v-else-if="item.field.type === 'group'"
        :currentForm="item.field"
        :pathContext="pathContext"
        @removeObject="removeObject(item.field)"
      />
      <component
        v-else
        :is="item.field.type === 'object' ? ContainerObject : ContainerArray"
        :currentForm="item.field"
        :pathContext="pathContext"
        @removeObject="removeObject(item.field)"
      />
    </FormItem>
  </el-row>
</template>

<script setup lang="ts">
import { getUUID } from "@/utils";
import { useDraggable } from "vue-draggable-plus";
import { checkForm } from "../code/checkForm.ts";
import { hasFieldData, removeFieldData } from "../code/fieldData";
import { isFieldRemoved } from "../code/fieldVisible";
import { DF_MODULE_SELECT, DF_ROOT_DATA } from "../code/injectionKeys.ts";
import type { DataPathContext } from "../code/pathContext";
import ContainerSlot from "./containerSlot.vue";
import ContainerArray from "./containerArray.vue";
import ContainerObject from "./containerObject.vue";
import FormError from "./formError.vue";
import FormItem from "./formItem.vue";

defineOptions({ name: "FormRenderer" });
const { pathContext } = defineProps<{
  pathContext?: DataPathContext;
}>();
const rootData: any = inject(DF_ROOT_DATA);
const row: any = useTemplateRef("row");
// 表单数据
const items = defineModel<any>("items", {});
// 编辑器移除已归档模块与尚未添加的字段，隐藏模块仍保留在编辑器中
const renderFields = computed(() => {
  const fields = items.value.fields || [];
  return fields
    .map((field: any, index: number) => ({ field, index }))
    .filter(
      ({ field }: any) =>
        !isFieldRemoved(rootData.data, field, pathContext) &&
        (!field.addable || hasFieldData(rootData.data, field, pathContext)),
    );
});
const isDragging = ref(false);
// 模块选中能力：由根组件提供，动态表单内部契约，调用方按约定传 key
const moduleSelect = inject(DF_MODULE_SELECT)!;
// 模块是否处于选中状态：与选中的模块 key 匹配时边框持续闪烁
const isModuleSelected = (item: any) => moduleSelect.selectedKey.value === item.key;
// 鼠标经过模块恢复正常：清除选中状态停止闪烁
const handleModuleMouseEnter = (item: any) => {
  if (isModuleSelected(item)) {
    moduleSelect.selectModule(null);
  }
};
// 拖拽实例
let draggable: ReturnType<typeof useDraggable> | null = null;

// 当前字段由渲染节点直接绑定，删除时不依赖过滤前后的数组索引
function removeObject(field: any) {
  rootData.removeObject(field);
  const index = items.value.fields.indexOf(field);
  if (index >= 0) items.value.fields.splice(index, 1);
}
// 删除可添加字段的数据，保留字段模板以便后续重新添加
function removeField(field: any) {
  removeFieldData(rootData.data, field, pathContext);
}
function ensureFieldIds(fields: any[]) {
  if (!fields) return;
  fields.forEach((item: any) => {
    if (!item.id) {
      item.id = getUUID().slice(0, 4);
    }
  });
}

// 固定模块保底校正：无论拖拽如何发生，固定模块始终按原相对顺序排在最前
function keepFixedFirst() {
  const fields = items.value.fields || [];
  const fixed = fields.filter((field: any) => field.fixed);
  if (!fixed.length) return;
  const others = fields.filter((field: any) => !field.fixed);
  const next = [...fixed, ...others];
  if (next.some((field, index) => field !== fields[index])) {
    fields.splice(0, fields.length, ...next);
  }
}
onMounted(async () => {
  await nextTick();
  if (!items.value.id) {
    items.value.id = getUUID().slice(0, 4);
  }
  ensureFieldIds(items.value.fields);
  watch(
    () => [items.value?.fields, items.value?.fields?.length],
    () => {
      ensureFieldIds(items.value?.fields);
    },
  );

  if (!items.value?.drag) {
    return;
  }
  // 初始化拖拽
  draggable = useDraggable(row, items.value.fields, {
    animation: 150,
    ghostClass: "ghost",
    handle: items.value?.dragClass || "",
    // 固定模块不可被其它模块越过或交换
    onMove: (evt) => !evt.related?.dataset?.fixed,
    onStart() {
      isDragging.value = true;
    },
    onEnd() {
      keepFixedFirst();
      isDragging.value = false;
    },
  });
});
onUnmounted(() => {
  draggable?.destroy();
  draggable = null;
});
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
  border-radius: 20px;
}

.drag-container-active {
  position: relative;
  border-radius: 12px;
}
.drag-container-active::after {
  position: absolute;
  inset: 0px;
  z-index: 1;
  box-sizing: border-box;
  border: 2px dashed var(--color-sf-theme);
  border-radius: 12px;
  pointer-events: none;
  content: "";
}
</style>

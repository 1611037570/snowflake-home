<template>
  <el-row ref="row" :class="{ 'drag-container-active': isDragging }" :key="items.id">
    <!-- 容器子项样式与字段自身样式统一绑定到对应栅格项 -->
    <FormItem
      :currentForm="item.field"
      :class="[items.itemClass, item.field.colClass]"
      :data-module-key="item.field.key"
      :data-fixed="item.field.fixed ? 'true' : undefined"
      v-for="item in renderFieldsWithStyle"
      :key="item.field.id"
      :pathContext="getFieldPathContext(item.field)"
      :selected="isModuleSelected(item.field)"
      :draggable="items.drag === true"
      :drag-class="items.dragClass"
      :style="item.style"
      @mouseenter="handleModuleMouseEnter(item.field)"
      @remove="removeField(item.field)"
    >
      <!-- 校验失败：展示友好的错误提示 -->
      <FormError
        v-if="item.error"
        :error-msg="item.error"
        :raw="item.field"
      />
      <ContainerSlot
        v-else-if="item.field.type === 'group'"
        :currentForm="item.field"
        :pathContext="getFieldPathContext(item.field)"
        @removeObject="removeObject(item.field)"
      />
      <component
        v-else
        :is="item.field.type === 'object' ? ContainerObject : ContainerArray"
        :currentForm="item.field"
        :pathContext="getFieldPathContext(item.field)"
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
import { getFormItemStyles } from "../code/formItemStyle";
import { isFieldRemoved } from "../code/fieldVisible";
import { DF_MODULE_SELECT, DF_ROOT_DATA } from "../code/injectionKeys.ts";
import { applyVisibleOrder, keepFixedFirst } from "../code/orderData";
import { createDataPathContext, type DataPathContext } from "../code/pathContext";
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
// 分组声明 context 后，字段自身及其子项均在该对象节点内解析路径
const getFieldPathContext = (field: any): DataPathContext | undefined => {
  if (field?.type !== "group" || !Array.isArray(field.context) || !field.context.length) {
    return pathContext;
  }
  return createDataPathContext(field.context, pathContext);
};
const isFieldRenderable = (field: any) => {
  const fieldPathContext = getFieldPathContext(field);
  return (
    !isFieldRemoved(rootData.data, field, fieldPathContext) &&
    (!field.addable || hasFieldData(rootData.data, field, fieldPathContext))
  );
};
// 编辑器移除已归档模块与尚未添加的字段，隐藏模块仍保留在编辑器中
const renderFields = computed(() => {
  const fields = items.value.fields || [];
  return fields
    .map((field: any, index: number) => ({ field, index }))
    .filter(({ field }: any) => isFieldRenderable(field));
});
// 外层表单项复用栅格间距计算
const renderFieldsWithStyle = computed(() => {
  const fields = renderFields.value;
  const styles = getFormItemStyles(fields.map((item: any) => item.field));
  return fields.map((item: any, index: number) => {
    // 配置校验结果随渲染项传递，避免错误字符串被当作校验成功
    const result = checkForm(item.field);
    return {
      ...item,
      style: styles[index],
      error: result === true ? undefined : result,
    };
  });
});
// 拖拽只重排当前可见字段，未渲染字段保留在原数据槽位
const sortableFields = computed<any[]>({
  get: () => renderFields.value.map((item: any) => item.field),
  set: (value) => {
    applyVisibleOrder(items.value.fields || [], value, isFieldRenderable);
  },
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
// 拖拽实例：延迟到真实根元素挂载完成后再启动
const draggable = useDraggable(null, sortableFields, {
  immediate: false,
  animation: 300,
  easing: "cubic-bezier(.2, .8, .2, 1)",
  ghostClass: "ghost",
  handle: items.value?.dragClass || "",
  // 用克隆体跟手拖拽，才能给拖拽中的模块加缩放与投影
  forceFallback: true,
  fallbackClass: "df-drag-fallback",
  fallbackOnBody: true,
  // 固定模块不可被其它模块越过或交换
  onMove: (evt) => !evt.related?.dataset?.fixed,
  onStart() {
    isDragging.value = true;
  },
  onEnd() {
    // 固定模块保底校正：无论拖拽如何发生，固定模块始终按原相对顺序排在最前
    keepFixedFirst(items.value.fields || [], (field: any) => field.fixed);
    isDragging.value = false;
  },
});

// 当前字段由渲染节点直接绑定，删除时不依赖过滤前后的数组索引
function removeObject(field: any) {
  // 按字段主数据路径删除数据，保证嵌套模块与包裹组同样删得干净
  removeFieldData(rootData.data, field, getFieldPathContext(field));
  const index = items.value.fields.indexOf(field);
  if (index >= 0) items.value.fields.splice(index, 1);
}
// 删除可添加字段的数据，保留字段模板以便后续重新添加
function removeField(field: any) {
  removeFieldData(rootData.data, field, getFieldPathContext(field));
}
function ensureFieldIds(fields: any[]) {
  if (!fields) return;
  fields.forEach((item: any) => {
    if (!item.id) {
      item.id = getUUID().slice(0, 4);
    }
  });
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

  const element = row.value?.$el ?? row.value;
  if (!(element instanceof HTMLElement)) return;

  // 根元素就绪后再启动拖拽
  draggable.start(element);
});
onUnmounted(() => {
  draggable.destroy();
});
</script>

<style scoped>
/* 拖拽时原位仅保留占位高度，视觉上不可见 */
.ghost {
  opacity: 0;
}

/* 跟手拖拽的克隆体：抬升并微放大，位移由 Sortable 每帧写入 matrix 控制 */
.df-drag-fallback {
  transform: scale(1.03);
  /* 与卡片自身 rounded-3xl 保持一致，避免拖拽时圆角突变 */
  border-radius: 24px;
  opacity: 1 !important;
  box-shadow: 0 14px 30px rgba(17, 24, 39, 0.18);
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

<template>
  <!-- 选中边框画在最外层栅格项上，与模块卡片的可见范围保持一致 -->
  <el-col
    :class="[{ 'dynamic-form-muted': hiddenState }, { 'module-selected-blink': selected }]"
    :span="getSpan(currentForm.span)"
  >
    <SfFormItem
      class="w-full"
      :label="currentForm.label"
      :prop="getProp(currentForm)"
      :rules="currentForm.rules"
    >
      <!-- 无标签的字段不提供标签插槽，避免渲染出空白标签行 -->
      <template v-if="currentForm.label" #label>
        <div class="mb-1 flex h-5 w-full items-center text-sf-base" @click.stop.prevent="">
          <div class="flex flex-1 items-center">
            <SfIcon
              v-if="draggable"
              @click.stop=""
              icon="icon-park-outline:drag"
              :class="dragHandleClass"
              size="4"
              boxSize="6"
              class="mr-1 cursor-move! rounded-xl hover:bg-sf-theme hover:text-sf-theme-text"
            />
            <span class="pr-1 pl-2 text-[15px] text-sf-text">
              {{ currentForm.label }}
            </span>
            <sf-tooltip :content="currentForm.tip" v-if="currentForm.tip" class="text-sf-text" />
          </div>
          <SfIcon
            v-if="currentForm.ui?.hidden"
            @pointerdown.stop.prevent
            @click.stop.prevent="toggleHidden"
            :icon="hidden ? 'lucide:eye' : 'lucide:eye-off'"
            size="4"
            class="cursor-pointer hover:text-sf-theme"
          />
          <SfIcon
            v-if="currentForm.ui?.removable"
            @pointerdown.stop.prevent
            @click.stop.prevent="removeField"
            icon="ic:round-delete"
            size="4"
            class="cursor-pointer hover:text-sf-theme"
          />
        </div>
      </template>
      <slot />
    </SfFormItem>
  </el-col>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import { getFieldDataPath } from "../code/fieldData";
import { isFieldHidden } from "../code/fieldVisible";
import { DF_ROOT_DATA } from "../code/injectionKeys";
import type { DataPathContext } from "../code/pathContext";

const { pathContext, currentForm, selected, draggable, dragClass } = defineProps<{
  currentForm: any;
  selected?: boolean;
  pathContext?: DataPathContext;
  draggable?: boolean;
  dragClass?: string;
}>();
const emit = defineEmits<{
  remove: [];
}>();
const rootData: any = inject(DF_ROOT_DATA);
const hiddenBinding = computed(() => currentForm?.ui?.hidden);
// 表单项直接读取自身的隐藏绑定，避免把 UI 状态传给实际输入组件
const hidden = computed(() => {
  const binding = hiddenBinding.value;
  if (!binding || typeof binding !== "object" || !binding.source?.length) return false;
  return rootData.getDataProxy(binding, pathContext).hidden ?? false;
});
// 表单项根据自身配置判断置灰状态
const hiddenState = computed(() => isFieldHidden(rootData.data, currentForm, pathContext));
const dragHandleClass = computed(() => {
  const value = dragClass?.trim();
  return value?.startsWith(".") ? value.slice(1) : value || "item-drag";
});
const DEFAULT_SPAN = 24;
// 切换表单项隐藏状态并写回数据
const toggleHidden = () => {
  const binding = hiddenBinding.value;
  if (!binding || typeof binding !== "object" || !binding.source?.length) return;
  rootData.setDataProxy(binding, pathContext)["update:hidden"]?.(!hidden.value);
};
// 删除当前可添加字段
const removeField = () => emit("remove");
// 由当前上下文中的完整数据路径推导表单校验属性
const getProp = (field: any) => getFieldDataPath(field, pathContext)?.join(".");
// 处理span值
const getSpan = (span: number | string | undefined) => {
  // 转换为数字
  const num = Number(span);
  // 无效值返回默认值
  if (isNaN(num)) return DEFAULT_SPAN;
  // 小于1返回默认值
  if (num < 1) return DEFAULT_SPAN;
  // 超出范围则取最大24
  if (num > DEFAULT_SPAN) return DEFAULT_SPAN;
  return num;
};
</script>

<style scoped>
/* 表单控制项置灰时统一应用灰度效果 */
.dynamic-form-muted {
  filter: grayscale(1);
}

.dynamic-form-muted :deep(.el-collapse),
.dynamic-form-muted :deep(.el-collapse-item__header),
.dynamic-form-muted :deep(.el-collapse-item__wrap) {
  color: var(--color-sf-text-3) !important;
}
/* 选中模块：边框持续闪烁提示 */
.module-selected-blink {
  position: relative;
}
.module-selected-blink::after {
  position: absolute;
  inset: 0;
  z-index: 1;
  box-sizing: border-box;
  border: 2px dashed var(--color-sf-theme);
  /* 与卡片自身 rounded-3xl 保持一致，避免边框圆角与卡片不齐 */
  border-radius: 24px;
  pointer-events: none;
  content: "";
}
</style>

<script>
// 字段自增序号：模块级变量，跨组件实例共享，保证同页面多个字段 key 唯一
let diffFieldSeq = 0;
</script>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import DiffContent from "./diffContent.vue";
import { diffFieldRegistry } from "./diffFieldRegistry";

// debug 开关：改为 true 后所有字段强制携带草稿 newValue，用于测试 diff 悬浮弹窗
const DEBUG_FORCE_DIFF = false;

// 字段代理对象：v-model 绑定，包含 value 与 newValue
const model = defineModel();

const props = defineProps({
  // 是否按富文本 HTML 渲染
  html: {
    type: Boolean,
    default: false,
  },
});

// 打印/导出期间强制展示原值，隐藏 diff 对比效果
const { isPrinting } = storeToRefs(useResumeStore());

// diff 参与级别：none 非编辑态原值无交互；render 仅渲染草稿（编辑态测量容器）；full 渲染草稿+高亮+悬浮交互
const diffMode = inject("diffMode", "none");
// 是否挂交互：仅实际分页内容注册 registry 与高亮，测量容器不挂监听
const canInteract = diffMode === "full";

// 字段唯一标识：元素上以 data-field-key 标记，供容器事件委托定位；挂载注册、卸载注销
const fieldKey = `df-${++diffFieldSeq}`;
onMounted(() => {
  // 非 diff 交互场景不注册：离屏测量容器与只读预览均无需悬浮交互
  if (!canInteract) return;
  // 注册快照而非原始 model：debug 强制草稿时 fieldSnap 含 newValue，事件委托据此判定是否展示弹窗
  diffFieldRegistry.set(fieldKey, { model: () => fieldSnap.value, html: props.html });
});
onBeforeUnmount(() => {
  if (!canInteract) return;
  diffFieldRegistry.delete(fieldKey);
});

// 字段快照：编辑态 model 为 { value, newValue } 代理，非编辑态为原始值；按 newValue 属性自动区分结构
// debug 仅对编辑态实际分页内容（full 档）强制注入草稿 newValue，测量容器与非编辑态调用方不受 debug 影响
const fieldSnap = computed(() => {
  const v = model.value;
  if (v == null) return { value: "", newValue: "", hasNew: false };
  // debug 强制草稿仅跟随交互档位（full），测量容器与只读场景不强制
  const forceDraft = DEBUG_FORCE_DIFF && canInteract;
  if (typeof v === "object" && "newValue" in v) {
    const value = v.value ?? "";
    let newValue = v.newValue ?? "";
    if (forceDraft && !newValue) newValue = `${value}（测试草稿）`;
    return { value, newValue, hasNew: newValue !== "" };
  }
  const value = v;
  const newValue = forceDraft ? `${value}（测试草稿）` : "";
  return { value, newValue, hasNew: newValue !== "" };
});
// 文档流统一渲染：有草稿显示新增，否则显示原值；打印时固定展示原值
const documentContent = computed(() =>
  isPrinting.value ? fieldSnap.value.value : fieldSnap.value.newValue || fieldSnap.value.value,
);
// 草稿高亮：仅开启 diff 交互且有草稿时展示，其余场景不高亮
const documentClass = computed(() => {
  if (!canInteract || isPrinting.value || !fieldSnap.value.hasNew) return "";
  return "cursor-pointer rounded-xl bg-[#e8f5e9] text-[#2e7d32]";
});
// 文档流有内容才渲染（与 documentContent 空判等价，避免重复判断）
const hasContent = computed(() => documentContent.value !== "");
</script>

<template>
  <!-- HTML 富文本：直接渲染块元素，避免包装div导致分页无法按块拆分；高亮与字段标记经 attrs 透传到各块 -->
  <template v-if="html && hasContent">
    <DiffContent
      :content="documentContent"
      :html="html"
      :class="documentClass"
      :data-field-key="fieldKey"
    />
  </template>
  <!-- 纯文本：仅渲染文档流，悬浮交互由容器事件委托按 data-field-key 提供 -->
  <div
    v-else-if="hasContent"
    class="relative max-w-full min-w-0 break-words"
    :class="documentClass"
    :data-field-key="fieldKey"
  >
    <DiffContent :content="documentContent" :html="html" />
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";

const modelValue = defineModel();

// 是否正在编辑
const isEditing = ref(false);
// 编辑态输入框容器：用于判断点击是否落在输入框内
const editBox = ref();
// 文档级点击监听停止函数
let stopDocListen;

// 进入编辑模式
function startEdit() {
  isEditing.value = true;
  // 文档级捕获点击：点击输入框外部任意处退出编辑，规避拖拽手柄 preventDefault 导致失焦丢失
  stopDocListen = useEventListener(
    document,
    "mousedown",
    (e) => {
      if (editBox.value?.contains(e.target)) return;
      finishEdit();
    },
    { capture: true },
  );
  // 下一帧自动聚焦：直接定位容器内 input，避免依赖组件 expose 的时序
  nextTick(() => {
    setTimeout(() => {
      editBox.value?.querySelector("input")?.focus();
    }, 0);
  });
}

// 退出编辑模式
function finishEdit() {
  stopDocListen?.();
  stopDocListen = null;
  isEditing.value = false;
}

// 卸载时清理文档监听，避免编辑态残留
onBeforeUnmount(() => stopDocListen?.());

// 处理键盘回车：仅在回车时阻止默认行为（避免触发外层表单提交）并退出编辑
function handleKeydown(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    finishEdit();
  }
}
</script>
<template>
  <div class="flex-1 truncate">
    <span
      v-if="!isEditing"
      class="border-sf-border cursor-pointer rounded-3xl border border-dashed border-transparent px-1 hover:border-dashed hover:border-sf-theme hover:outline-offset-1"
      @click.stop.prevent="startEdit"
      @focus.stop.prevent
    >
      {{ modelValue }}
    </span>
    <div ref="editBox" v-else class="w-[120px]">
      <SfInput
        v-model="modelValue"
        class="rounded border border-sf-theme outline-none"
        @click.stop.prevent
        @focus.stop
        @blur="finishEdit"
        @keydown.stop="handleKeydown"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

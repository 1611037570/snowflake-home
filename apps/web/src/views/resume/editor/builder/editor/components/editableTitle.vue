<script setup>
import { ref, nextTick } from "vue";

const modelValue = defineModel();

// 是否正在编辑
const isEditing = ref(false);
// 输入框引用
const inputRef = ref();
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
  // 下一帧自动聚焦
  nextTick(() => {
    setTimeout(() => {
      inputRef.value?.focus();
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

// 处理键盘回车
function handleKeydown(e) {
  if (e.key === "Enter") {
    finishEdit();
  }
}
</script>
outline-offset-3 outline-dashed outline-sf-theme

<template>
  <template v-if="!isEditing">
    <span
      class="cursor-pointer rounded-3xl border-transparent px-1 hover:border-dashed hover:outline-offset-1 hover:outline-sf-theme hover:outline-dashed"
      @click.stop.prevent="startEdit"
      @focus.stop.prevent
    >
      {{ modelValue }}
    </span>
  </template>
  <div ref="editBox" v-else class="w-[140px]">
    <SfInput
      v-model="modelValue"
      class="rounded border border-sf-theme outline-none"
      @click.stop.prevent
      @focus.stop.prevent
      @blur="finishEdit"
      @keydown.stop.prevent="handleKeydown"
    />
  </div>
</template>

<style lang="scss" scoped></style>

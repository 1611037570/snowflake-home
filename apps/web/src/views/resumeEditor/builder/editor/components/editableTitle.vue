<script setup lang="ts">
import { ref, nextTick } from "vue";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

// 是否正在编辑
const isEditing = ref(false);
// 输入框引用
const inputRef = ref<HTMLInputElement>();

// 进入编辑模式
function startEdit() {
  isEditing.value = true;
  // 下一帧自动聚焦
  nextTick(() => {
    inputRef.value?.focus();
  });
}

// 退出编辑模式
function finishEdit() {
  isEditing.value = false;
}

// 处理键盘回车
function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    finishEdit();
  }
}
</script>

<template>
  <template v-if="!isEditing">
    <span
      class="cursor-pointer rounded px-1 hover:border hover:border-dashed hover:border-sf-theme/50"
      @click="startEdit"
    >
      {{ modelValue }}
    </span>
  </template>
  <input
    v-else
    ref="inputRef"
    :value="modelValue"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    class="w-auto rounded border border-sf-theme px-1 outline-none text-lg font-bold"
    @blur="finishEdit"
    @keydown="handleKeydown"
  />
</template>

<style lang="scss" scoped></style>

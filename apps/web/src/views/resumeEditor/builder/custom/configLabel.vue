<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  tip: {
    type: String,
    default: "",
  },
  // 恢复默认值对应的默认值
  defaultValue: {
    required: true,
  },
  // 当前绑定的值
  modelValue: {
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

// 一键恢复默认值
function resetToDefault() {
  emit("update:modelValue", props.defaultValue);
}
</script>

<template>
  <div class="mb-2 flex items-center text-sm text-sf-text-2">
    <span>{{ label }}</span>
    <sf-tooltip :content="tip" v-if="tip" class="ml-1 text-sf-text-2" />
    <!-- 值非默认时显示恢复默认值图标 -->
    <sf-tooltip content="恢复默认值" class="ml-auto">
      <SfIcon
        icon="material-symbols:restart-alt"
        size="4"
        class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
        @click.stop="resetToDefault"
      />
    </sf-tooltip>
  </div>
</template>

<style scoped></style>

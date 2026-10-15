<script setup>
const props = defineProps({
  icon: {
    type: String,
    default: "",
  },
  clickThrough: {
    type: Boolean, // 作为下拉触发器时允许点击继续传给外层组件。
    default: false,
  },
});

const emit = defineEmits(["click"]);

// 透传原生事件：父级使用 @click.stop 等修饰符时需要事件对象，否则修饰符守卫会报错
function handleClick(e) {
  if (!props.clickThrough) {
    e.stopPropagation();
    e.preventDefault();
  }
  emit("click", e);
}
</script>

<template>
  <!-- 编辑区删除图标仅在悬停时显示危险色，默认保留原有颜色。 -->
  <SfIcon
    :icon="icon"
    :class="{ 'hover:text-sf-error': icon === 'ic:round-delete' }"
    size="4"
    boxSize="6"
    @click="handleClick"
    class="cursor-pointer rounded-xl transition-all duration-300 hover:scale-110 hover:bg-sf-bg-3 active:scale-90"
  ></SfIcon>
</template>

<style lang="scss" scoped></style>

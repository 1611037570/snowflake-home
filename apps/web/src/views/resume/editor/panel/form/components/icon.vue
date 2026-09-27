<script setup>
defineProps({
  icon: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["click"]);

// 透传原生事件：父级使用 @click.stop 等修饰符时需要事件对象，否则修饰符守卫会报错
function handleClick(e) {
  emit("click", e);
}
</script>

<template>
  <SfIcon
    :icon="icon"
    size="4"
    boxSize="6"
    @click.stop.prevent="handleClick"
    class="cursor-pointer rounded-xl transition-all duration-300 hover:scale-110 hover:bg-sf-bg-3 active:scale-90"
  ></SfIcon>
</template>

<style lang="scss" scoped></style>

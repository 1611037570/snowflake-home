<script setup>
defineProps({
  icon: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["click"]);

function handleClick() {
  emit("click");
}
</script>

<template>
  <SfIcon
    :icon="icon"
    size="4"
    boxSize="6"
    @pointerdown.stop.prevent
    @click.stop.prevent="handleClick"
    class="cursor-pointer rounded-xl hover:bg-sf-theme hover:text-sf-theme-text"
  ></SfIcon>
</template>

<style lang="scss" scoped></style>

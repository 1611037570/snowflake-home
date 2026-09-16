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
    @click.stop.prevent="handleClick"
    class="cursor-pointer rounded-xl transition-all duration-300 hover:scale-105 hover:bg-sf-bg-3"
  ></SfIcon>
</template>

<style lang="scss" scoped></style>

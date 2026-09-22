<script setup>
import ExpItemList from "./expItemList.vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <ExpItemList :module-name="props.name" :data-key="props.name" />
</template>

<style lang="scss" scoped></style>

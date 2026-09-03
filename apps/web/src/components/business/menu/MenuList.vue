<template>
  <div class="w-[200px] overflow-hidden">
    <SfList :list="list" @onClick="select"></SfList>
  </div>
</template>

<script setup lang="ts">
defineProps({
  list: {
    type: Array<any>,
    default: () => [],
  },
  nameKey: {
    type: String,
    default: "name",
  },
});
const emit = defineEmits(["select"]);
const select = (item: any) => {
  emit("select", item);
};
</script>

<style scoped></style>

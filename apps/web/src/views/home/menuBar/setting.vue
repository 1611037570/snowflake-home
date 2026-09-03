<template>
  <SfDropdown trigger="hover">
    <sf-icon
      icon="iconamoon:settings-fill"
      size="8"
      class="text-sf-primary transition-all duration-200 hover:rotate-180"
    />

    <template #dropdown>
      <SfList :list="list"> </SfList>
    </template>
  </SfDropdown>
</template>
<!-- .el-dropdown-menu -->
<script setup>
import { useHomeStore } from "@/stores";
import { storeToRefs } from "pinia";
const openSet = () => {
  systemVisible.value = true;
};
provide("color", "text-sf-base");
const list = ref([
  {
    name: "功能设置",
    fn: openSet,
  },
]);
const homeStore = useHomeStore();
const { systemVisible } = storeToRefs(homeStore);
</script>

<style lang="scss" scoped></style>

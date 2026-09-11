<script setup>
// 模块管理：右侧工具栏入口复用统一的模块管理内容
import Icon from "../components/icon.vue";
import ModuleManagerContent from "../../components/moduleManager/content.vue";
</script>

<template>
  <SfDropdown trigger="click" placement="left-start" :show-arrow="false">
    <Icon icon="mdi:widgets" size="5" content="模块管理" />
    <template #dropdown>
      <ModuleManagerContent />
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>

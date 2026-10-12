<script setup>
// 模块搜索：右侧工具栏提供模块及内容的搜索定位入口。
import Icon from "../components/icon.vue";
import ModuleManagerContent from "../../components/moduleManager/content.vue";
import { $t } from "@/locales";
</script>

<template>
  <SfDropdown trigger="click" placement="left-start" :show-arrow="false">
    <Icon icon="lucide:search" size="5" :content="$t('moduleManager')" />
    <template #dropdown>
      <ModuleManagerContent />
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>

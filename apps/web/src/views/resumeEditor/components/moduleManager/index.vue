<script setup>
import ModuleManagerContent from "./content.vue";

defineOptions({ name: "ModuleManager" });
</script>

<template>
  <!-- 原生定位层承载悬浮位置，避免下拉组件内部定位样式使入口占据文档流 -->
  <div class="absolute -top-6 -right-3 z-10">
    <SfDropdown trigger="click" placement="bottom-end" :show-arrow="false">
      <SfTooltip content="模块管理">
        <SfIcon
          icon="mdi:widgets"
          size="5"
          boxSize="9"
          class="cursor-pointer rounded-full border border-sf-b bg-sf-primary text-sf-theme shadow-sm hover:bg-sf-theme-2"
        />
      </SfTooltip>
      <template #dropdown>
        <ModuleManagerContent />
      </template>
    </SfDropdown>
  </div>
</template>

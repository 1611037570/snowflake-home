<script setup>
defineOptions({ name: "ResumeToolbar" });

const size = 6;
const boxSize = 8;
</script>

<template>
  <div class="flex items-center py-3 pr-3">
    <div
      class="flex flex-col items-center rounded-3xl border border-sf-b bg-sf-primary p-1 text-sf-text-3"
    >
      <!-- 设置按钮 -->
      <SfTooltip content="系统设置" placement="left">
        <SfIcon
          icon="iconamoon:settings-fill"
          :size="size"
          :boxSize="boxSize"
          class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
        />
      </SfTooltip>

      <!-- 设置按钮 -->
      <SfTooltip content="助手设置" placement="left">
        <SfIcon
          icon="iconamoon:settings-fill"
          :size="size"
          :boxSize="boxSize"
          class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
        />
      </SfTooltip>
    </div>
  </div>
</template>

<style scoped></style>

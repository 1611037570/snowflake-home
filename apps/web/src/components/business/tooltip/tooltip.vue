<template>
  <div class="">
    <Component
      :effect="theme"
      :is="
        h(
          ElTooltip,
          { placement: 'top', ...$attrs, disabled: isMobile || $attrs.disabled, ref: changeRef },
          $slots,
        )
      "
    >
      <template #default>
        <slot>
          <SfIcon icon="mingcute:question-line" size="4" />
        </slot>
      </template>
      <template #content>
        <slot name="content"> </slot>
      </template>
    </Component>
  </div>
</template>

<script setup lang="ts">
import { useSystemStore, useThemeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { ElTooltip } from "element-plus";
import type { ComponentInstance } from "vue";
import { getCurrentInstance, h } from "vue";

defineOptions({ name: "SfTooltip" });

const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);

// 移动端无悬停交互，直接禁用提示气泡
const systemStore = useSystemStore();
const { isMobile } = storeToRefs(systemStore);

const vm: any = getCurrentInstance();

function changeRef(exports: any) {
  vm.exposed = exports;
}
defineExpose({} as ComponentInstance<typeof ElTooltip>);
</script>

<style lang="scss" scoped></style>

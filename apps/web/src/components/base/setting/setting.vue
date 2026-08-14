<template>
  <div @click="handleClick">
    <slot>
      <SfTooltip content="系统设置">
        <SfIcon
          icon="iconamoon:settings-fill"
          size="8"
          :class="color"
          class="transition-all duration-300 hover:scale-120"
        />
      </SfTooltip>
    </slot>
  </div>

  <SfModal v-model="visible" title="系统设置">
    <SfScrollbar height="500px" class="w-[400px]">
      <SfSetBox>
        <SfSetItem
          title="性能模式"
          info="开启后会优化性能，但会减少功能支持"
          v-model="performanceMode"
          type="switch"
          :divider="false"
        />
      </SfSetBox>
    </SfScrollbar>
  </SfModal>
</template>

<script setup>
import { useSystemStore } from "@/stores/modules/system";
const color = inject("color", "text-sf-base");
defineOptions({ name: "SfSetting" });
const visible = ref(false);
const handleClick = () => {
  visible.value = true;
};

const systemStore = useSystemStore();
/** 性能模式：开启后禁用所有动效（毛玻璃、3D倾斜、过渡动画） */
const { performanceMode } = storeToRefs(systemStore);
</script>

<style scoped></style>

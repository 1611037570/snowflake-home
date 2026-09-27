<script setup>
defineProps({
  selected: {
    type: Boolean,
    default: false,
  },
  // 可用移动方向：由预览层按栏位与前后位置计算，不可用的方向不渲染按钮
  directions: {
    type: Object,
    default: () => ({ up: false, down: false, left: false, right: false }),
  },
});
const emit = defineEmits({
  move: (direction) => typeof direction === "string",
  toggleSelect: () => true,
});
// 选择状态和修改行为由编辑器模式提供与处理。
const handleSelect = () => {
  emit("toggleSelect");
};
// 移动按钮样式：与选择按钮一致的悬浮显示
const moveButtonClass =
  "hidden cursor-pointer items-center justify-center rounded-full bg-sf-info p-1.5 text-white shadow hover:bg-sf-theme group-hover/module:flex";
</script>

<template>
  <div class="absolute -top-3 -right-3 z-10 flex items-center gap-1">
    <SfTooltip v-if="directions.up" :content="$t('moveUp')">
      <div :class="moveButtonClass" @click.stop="emit('move', 'up')">
        <SfIcon icon="lucide:arrow-up" size="3.5" />
      </div>
    </SfTooltip>
    <SfTooltip v-if="directions.down" :content="$t('moveDown')">
      <div :class="moveButtonClass" @click.stop="emit('move', 'down')">
        <SfIcon icon="lucide:arrow-down" size="3.5" />
      </div>
    </SfTooltip>
    <SfTooltip v-if="directions.left" :content="$t('moveLeft')">
      <div :class="moveButtonClass" @click.stop="emit('move', 'left')">
        <SfIcon icon="lucide:arrow-left" size="3.5" />
      </div>
    </SfTooltip>
    <SfTooltip v-if="directions.right" :content="$t('moveRight')">
      <div :class="moveButtonClass" @click.stop="emit('move', 'right')">
        <SfIcon icon="lucide:arrow-right" size="3.5" />
      </div>
    </SfTooltip>
    <SfTooltip :content="selected ? $t('cancelSelection') : $t('selectModule')">
      <div
        class="cursor-pointer items-center justify-center rounded-full p-1.5 text-white shadow hover:bg-sf-theme"
        :class="selected ? 'flex bg-sf-theme ' : 'hidden bg-sf-info group-hover/module:flex '"
        @click.stop="handleSelect"
      >
        <SfIcon icon="lucide:pencil" size="3.5" />
      </div>
    </SfTooltip>
  </div>
</template>

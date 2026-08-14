<script setup>
defineProps({
  selected: {
    type: Boolean,
    default: false,
  },
});
defineEmits(["discard", "accept", "select"]);
</script>

<template>
  <div class="absolute -top-3 -right-3 z-10 flex items-center gap-1">
    <SfTooltip content="该模块全部放弃">
      <div
        class="hidden cursor-pointer items-center justify-center rounded-full bg-red-500 p-1.5 text-white shadow group-hover:flex hover:bg-red-600"
        @click.stop="$emit('discard')"
      >
        <SfIcon icon="lucide:x" size="4" />
      </div>
    </SfTooltip>
    <SfTooltip content="该模块全部保留">
      <div
        class="hidden cursor-pointer items-center justify-center rounded-full bg-green-500 p-1.5 text-white shadow group-hover:flex hover:bg-green-600"
        @click.stop="$emit('accept')"
      >
        <SfIcon icon="lucide:check" size="4" />
      </div>
    </SfTooltip>
    <SfTooltip :content="selected ? '取消选择' : '选择该模块'">
      <div
        class="cursor-pointer items-center justify-center rounded-full p-1.5 text-white shadow hover:bg-sf-theme-hover"
        :class="selected ? 'flex bg-sf-theme ' : 'hidden bg-sf-info group-hover:flex '"
        @click.stop="$emit('select')"
      >
        <SfIcon icon="lucide:pencil" size="3.5" />
      </div>
    </SfTooltip>
  </div>
</template>

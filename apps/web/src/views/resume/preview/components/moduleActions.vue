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
    <button
      type="button"
      class="hidden cursor-pointer items-center justify-center rounded-full bg-red-500 p-1.5 text-white shadow group-hover:flex hover:bg-red-600"
      title="放弃该模块"
      @click.stop="$emit('discard')"
    >
      <SfIcon icon="lucide:x" size="4" />
    </button>
    <button
      type="button"
      class="hidden cursor-pointer items-center justify-center rounded-full bg-green-500 p-1.5 text-white shadow group-hover:flex hover:bg-green-600"
      title="同意该模块"
      @click.stop="$emit('accept')"
    >
      <SfIcon icon="lucide:check" size="4" />
    </button>
    <button
      type="button"
      class="cursor-pointer items-center justify-center rounded-full p-1.5 text-white shadow hover:bg-sf-theme-hover"
      :class="selected ? 'flex bg-sf-theme ' : 'hidden bg-sf-info group-hover:flex '"
      title="选择该模块"
      @click.stop="$emit('select')"
    >
      <SfIcon icon="lucide:pencil" size="4" />
    </button>
  </div>
</template>

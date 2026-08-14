<template>
  <div class="mb-3 flex w-full items-center justify-between">
    <div class="flex flex-1 items-center">
      <span class="text-xl font-bold">{{ name }}</span>
      <SfIcon
        v-if="reset"
        icon="material-symbols:restart-alt"
        size="8"
        class="hover:text-sf-theme"
        @click.stop="resetClick"
      />
    </div>
    <slot name="right"></slot>
  </div>
</template>

<script setup>
const emit = defineEmits(['reset'])
defineProps({ name: { type: String, default: '' }, reset: { type: Boolean, default: false } })
function resetClick() {
  emit('reset')
}
</script>

<template>
  <div class="cursor-pointer rounded-xl p-2 transition hover:bg-sf-bg-hover">
    <div class="mb-1 flex items-center font-medium text-sf-base">
      <SfLogo v-if="data.icon" :name="data.icon" :size="5" class="mr-2 shrink-0" />
      <div class="truncate">
        {{ data.name }}
      </div>
    </div>
    <div class="text-sm text-sf-text-2" v-if="data.desc">{{ data.desc }}</div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    required: true,
  },
})
</script>

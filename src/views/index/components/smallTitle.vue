v
<template>
  <h3 class="group flex-c my-5 text-lg font-semibold">
    <BaseIcon
      size="5"
      icon="lucide:briefcase"
      class="mr-2 text-sf-theme transition-transform duration-300 group-hover:rotate-[-12deg]"
    />
    <span class="group-hover:text-sf-theme">{{ title }}</span>
  </h3>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '项目经历',
  },
})
</script>

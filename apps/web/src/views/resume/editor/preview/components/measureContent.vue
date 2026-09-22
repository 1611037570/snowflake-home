<script setup>
import ModuleSlot from "../resumePages/moduleSlot.vue";

defineProps({
  allModules: {
    type: Array,
    required: true,
  },
});

</script>

<template>
  <div class="flex flex-col">
    <template v-for="(item, index) in allModules" :key="index">
      <ModuleSlot :module-key="item.key" />
    </template>
  </div>
</template>

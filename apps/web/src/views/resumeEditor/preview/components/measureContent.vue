<script setup>
import ResumeModule from "../modules/index.vue";

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
      <ResumeModule
        :data="item"
        :name="item.isCustom ? 'custom' : item.key"
        :customId="item.key"
        class="resume-module-wrapper"
      />
    </template>
  </div>
</template>

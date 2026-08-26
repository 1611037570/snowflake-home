<script setup>
import Icon from "../components/icon.vue";
import { ref } from "vue";

const visible = ref(false);
</script>

<template>
  <Icon icon="fa6-solid:file-export" size="4" content="导出简历" @click="visible = true" />

  <SfModal v-model="visible" title="导出简历">
    <div class="flex w-[400px] flex-col gap-5 p-4"></div>
  </SfModal>
</template>

<style lang="scss" scoped></style>

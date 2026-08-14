<script setup>
import { useNoteStore } from "@/stores";
import Note from "./index.vue";
const noteStore = useNoteStore();
const { noteVisible } = storeToRefs(noteStore);
</script>

<template>
  <SfModal v-model="noteVisible" v-if="noteVisible" title="便签">
    <Note />
  </SfModal>
</template>
<style lang="scss" scoped></style>

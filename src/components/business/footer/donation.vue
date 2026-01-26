<template>
  <SfModal v-model="modalValue">
    <Donation />
  </SfModal>
</template>
<script setup>
import Donation from '@/views/home/about/modalDonation.vue'
const modalValue = defineModel()
</script>

<template>
  <div class="flex items-center" @click="modalValue = true">
    <slot>
      <SfTooltip content="支持项目">
        <SfIcon icon="lucide:heart" size="7" class="text-sf-base" />
      </SfTooltip>
    </slot>
    <SfModal v-model="modalValue">
      <Donation />
    </SfModal>
  </div>
</template>
<script setup>
import Donation from '@/views/home/about/modalDonation.vue'
const modalValue = defineModel()
</script>

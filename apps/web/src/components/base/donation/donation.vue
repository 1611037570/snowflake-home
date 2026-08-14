<script setup>
defineOptions({ name: 'SfDonation' })
import Donation from '@/views/home/about/modalDonation.vue'
const modalValue = defineModel()

const color = inject('color', 'text-sf-base')
</script>

<template>
  <div class="flex items-center" @click="modalValue = true">
    <slot>
      <SfTooltip content="支持项目">
        <SfIcon
          icon="solar:heart-bold"
          size="8"
          :class="color"
          class="transition-all duration-300 hover:scale-120"
        />
      </SfTooltip>
    </slot>
    <SfModal v-model="modalValue">
      <Donation />
    </SfModal>
  </div>
</template>

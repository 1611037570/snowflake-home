<script setup>
defineOptions({ name: "SfDonation" });
import Donation from "./modalDonation.vue";
import Money from "./money.vue";

const modalValue = defineModel();

const color = inject("color", "text-sf-base");
</script>

<template>
  <div class="flex items-center" @click="modalValue = true">
    <slot>
      <SfTooltip :content="$t('core.donation.supportProject')">
        <SfIcon
          icon="solar:heart-bold"
          size="8"
          :class="color"
          class="transition-all duration-300 hover:scale-120"
        />
      </SfTooltip>
    </slot>
    <SfModal v-model="modalValue" :title="$t('core.donation.supportProject')">
      <Money />
      <Donation />
    </SfModal>
  </div>
</template>

<script setup>
defineOptions({ name: "SfDonation" });
import Donation from "./modalDonation.vue";
import Money from "./money.vue";


// 图形尺寸与交互区域分别配置，默认保留其他页面的原有外观。
const props = defineProps({
  // 图标图形大小，使用间距单位。
  size: { type: [String, Number], default: 8 },
  // 图标交互区域大小，未设置时沿用图形大小。
  boxSize: { type: [String, Number], default: undefined },
});

const modalValue = defineModel();

const color = inject("color", "text-sf-base");
</script>

<template>
  <div class="flex items-center" @click="modalValue = true">
    <slot>
      <SfTooltip :content="$t('core.donation.supportProject')">
        <SfIcon
          icon="solar:heart-bold"
          :size="props.size"
          :box-size="props.boxSize"
          :class="[color, props.boxSize ? 'cursor-pointer rounded-lg transition-colors hover:bg-sf-bg' : 'transition-all duration-300 hover:scale-120']"
        />
      </SfTooltip>
    </slot>
    <SfModal v-model="modalValue" :title="$t('core.donation.supportProject')">
      <Money />
      <Donation />
    </SfModal>
  </div>
</template>

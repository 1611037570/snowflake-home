<script setup>
import { computed } from "vue";

const props = defineProps({
  size: {
    type: Number || String,
    default: 7.5,
  },
});

const logoSize = computed(() => Number(props.size) * 4);

const logoStyle = computed(() => ({
  width: `${logoSize.value}px`,
  height: `${logoSize.value}px`,
}));

const shapeStyle = computed(() => ({
  width: `${(logoSize.value * 22) / 34}px`,
  height: `${(logoSize.value * 18) / 34}px`,
  borderRadius: `${(logoSize.value * 8) / 34}px ${(logoSize.value * 2) / 34}px ${(logoSize.value * 8) / 34}px ${(logoSize.value * 2) / 34}px`,
}));
</script>

<template>
  <div class="resume-logo relative flex items-center justify-center" :style="logoStyle">
    <div class="absolute top-1/2 left-0 -translate-y-1/2" :style="shapeStyle">
      <div class="resume-logo-left h-full w-full bg-sf-theme" :style="shapeStyle"></div>
    </div>
    <div class="absolute top-1/2 right-0 -translate-y-1/2 skew-x-[-18deg]" :style="shapeStyle">
      <div class="resume-logo-right h-full w-full bg-sf-theme-hover" :style="shapeStyle"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.resume-logo:hover .resume-logo-left {
  animation: logo-left 0.8s ease-in-out forwards;
}

.resume-logo:hover .resume-logo-right {
  animation: logo-right 0.8s ease-in-out forwards;
}

@keyframes logo-left {
  from {
    transform: translateX(20%) rotate(8deg);
  }

  to {
    transform: translateX(0) rotate(0deg);
  }
}

@keyframes logo-right {
  from {
    transform: translateX(-20%) rotate(-8deg);
  }

  to {
    transform: translateX(0) rotate(0deg);
  }
}
</style>

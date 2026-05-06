<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: Number,
    default: 16,
  },
})

const logoStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))

const shapeStyle = computed(() => ({
  width: `${(props.size * 22) / 34}px`,
  height: `${(props.size * 18) / 34}px`,
  borderRadius: `${(props.size * 8) / 34}px ${(props.size * 2) / 34}px ${(props.size * 8) / 34}px ${(props.size * 2) / 34}px`,
}))
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

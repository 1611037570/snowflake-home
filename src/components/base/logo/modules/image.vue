<script setup>
import { computed } from 'vue'
import { routerNavigation } from '@/utils'

const props = defineProps({
  size: {
    type: Number,
    default: 7.5,
  },
})

const logoSize = computed(() => props.size * 4)

const logoStyle = computed(() => ({
  width: `${logoSize.value}px`,
  height: `${logoSize.value}px`,
  fontSize: `${logoSize.value / 10}px`,
  borderRadius: `${logoSize.value * 0.2}px`,
}))

function goImage() {
  routerNavigation('image')
}
</script>

<template>
  <div class="image-logo" :style="logoStyle" @click="goImage">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
  </div>
</template>

<style scoped>
.image-logo {
  /* position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%); */
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  --icon-color: 1;
  transform-origin: center;
}

.image-logo span {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 22.5%;
  height: 44.5%;
  border-radius: 50% / 30%;
  transform-origin: center 105%;
  transform: translate(-50%, -105%) rotate(calc((var(--n) - 1) * 45deg));
  background-color: var(--c);
  mix-blend-mode: multiply;
  z-index: 10;
}

.image-logo:hover span {
  animation: rotating 0.8s ease-in-out forwards;
}

@keyframes rotating {
  from {
    transform: translate(-50%, -105%) rotate(0deg);
  }

  to {
    transform: translate(-50%, -105%) rotate(calc((var(--n) - 1) * 45deg));
  }
}

.image-logo span:nth-child(1) {
  --n: 9;
  --c: rgba(243, 156, 18, var(--icon-color));
}

.image-logo span:nth-child(2) {
  --n: 2;
  --c: rgba(241, 196, 15, var(--icon-color));
}

.image-logo span:nth-child(3) {
  --n: 3;
  --c: rgba(46, 204, 113, var(--icon-color));
}

.image-logo span:nth-child(4) {
  --n: 4;
  --c: rgba(27, 188, 155, var(--icon-color));
}

.image-logo span:nth-child(5) {
  --n: 5;
  --c: rgba(65, 131, 215, var(--icon-color));
}

.image-logo span:nth-child(6) {
  --n: 6;
  --c: rgba(102, 51, 153, var(--icon-color));
}

.image-logo span:nth-child(7) {
  --n: 7;
  --c: rgba(155, 89, 182, var(--icon-color));
}

.image-logo span:nth-child(8) {
  --n: 8;
  --c: rgba(242, 38, 19, var(--icon-color));
}
</style>

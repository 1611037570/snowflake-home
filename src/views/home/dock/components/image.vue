vue
<template>
  <div
    class="icon bg-sf-primary"
    @click="goImage"
    style="backdrop-filter: blur(10px) saturate(1.5)"
  >
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

<script setup>
import { routerNavigation } from '@/utils'
function goImage() {
  routerNavigation('image')
}
</script>

<style scoped>
.icon {
  width: 40px;
  height: 40px;
  font-size: 4px;
  border-radius: 20%;
  position: relative;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  padding: 1em;
  --icon-color: 1;
}

.icon span {
  position: absolute;
  width: 22.5%;
  height: 37.5%;
  border-radius: 50% / 30%;
  transform-origin: center 105%;
  transform: rotate(calc((var(--n) - 1) * 45deg));
  background-color: var(--c);
  mix-blend-mode: multiply;
  z-index: 10;
}

/* 深色模式下增加颜色亮度，确保在混合模式下依然清晰可见 */
/* [data-theme='dark'] .icon span {
  filter: brightness(1.5);
} */

.icon:hover span {
  animation: rotating 0.8s ease-in-out forwards;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(calc((var(--n) - 1) * 45deg));
  }
}
.icon span:nth-child(1) {
  --n: 9;
  --c: rgba(243, 156, 18, var(--icon-color));
}

.icon span:nth-child(2) {
  --n: 2;
  --c: rgba(241, 196, 15, var(--icon-color));
}

.icon span:nth-child(3) {
  --n: 3;
  --c: rgba(46, 204, 113, var(--icon-color));
}

.icon span:nth-child(4) {
  --n: 4;
  --c: rgba(27, 188, 155, var(--icon-color));
}

.icon span:nth-child(5) {
  --n: 5;
  --c: rgba(65, 131, 215, var(--icon-color));
}

.icon span:nth-child(6) {
  --n: 6;
  --c: rgba(102, 51, 153, var(--icon-color));
}

.icon span:nth-child(7) {
  --n: 7;
  --c: rgba(155, 89, 182, var(--icon-color));
}

.icon span:nth-child(8) {
  --n: 8;
  --c: rgba(242, 38, 19, var(--icon-color));
}
</style>

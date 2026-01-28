<template>
  <div
    class="relative flex items-center justify-center overflow-hidden rounded-[50%]"
    :style="`width: ${width}px; height: ${height}px;`"
  >
    <div class="z-10">
      <slot> {{ percentage }} </slot>
    </div>
    <div
      class="water-ripple absolute h-[300%] w-[300%] rounded-[44%]"
      :style="{
        top: `calc(100% - ${percentage}%)`,
      }"
    ></div>
  </div>
</template>

<script setup>
defineProps({
  width: { type: Number, default: 100 },
  height: { type: Number, default: 100 },
  percentage: { type: Number, default: 20 },
})
</script>

<style lang="scss" scoped>
.water-ripple {
  left: 50%;
  transform: translateX(-50%);
  animation: wave 5s infinite linear;
  box-shadow: 0 0 10px 1px rgba(136, 204, 246, 0.6);
  background: #42adf9;
}
@keyframes wave {
  0% {
    transform: translateX(-50%) rotate(00deg);
  }

  100% {
    transform: translateX(-50%) rotate(360deg);
  }
}
</style>

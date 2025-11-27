<template>
  <div
    class="scroll-reveal w-[300px] overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    @click="handleClick"
  >
    <div class="h-36 overflow-hidden">
      <ElImage
        src="https://picsum.photos/id/180/800/500"
        :alt="data.name"
        class="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
      />
    </div>
    <div class="p-3">
      <h3 class="text-dark mb-2 text-sm font-bold">{{ data.name }}</h3>
      <p class="mb-3 text-xs text-gray-600" v-if="data.desc">
        {{ data.desc }}
      </p>
      <div class="text-primary hover:text-primary/80 inline-flex items-center font-medium">
        查看详情 <i class="fa fa-arrow-right ml-2"></i>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
})
// routeNavigation
const handleClick = () => {
  routerNavigation(props.data.url)
}
</script>

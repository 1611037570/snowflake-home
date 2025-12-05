<template>
  <div
    class="flex cursor-pointer flex-col overflow-hidden rounded-xl bg-sf-primary text-sf-text shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    @click="handleClick"
    :class="$s(75, 'w')"
  >
    <ElImage
      src="https://picsum.photos/id/180/800/500"
      :alt="data.name"
      class="h-38 w-full overflow-hidden object-cover"
    />
    <div class="p-3">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold">{{ data.name }}</h3>
        <div class="flex items-center text-sm text-sf-text-3">
          查看详情 <i class="fa fa-arrow-right ml-2"></i>
        </div>
      </div>
      <p class="mt-3 text-xs text-sf-text-2" v-if="data.desc">
        {{ data.desc }}
      </p>
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

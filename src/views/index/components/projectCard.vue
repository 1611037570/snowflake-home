<template>
  <div
    class="flex cursor-pointer flex-col overflow-hidden rounded-xl bg-sf-primary px-3.5 text-sf-text shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    @click="handleClick"
    :class="$s(75, 'w')"
  >
    <SfImg
      src="https://picsum.photos/id/180/800/500"
      :alt="data.name"
      class="w-full overflow-hidden object-cover"
      :class="$s(38, 'h')"
    />
    <div :class="$s(3, 'p')">
      <div class="flex items-center justify-between">
        <h3 class="font-bold" :class="$s(5)">{{ data.name }}</h3>
        <div class="flex items-center text-sf-text-3" :class="$s(4)">
          查看详情 <i class="fa fa-arrow-right ml-2"></i>
        </div>
      </div>
      <p class="mt-3 text-sf-text-2" v-if="data.desc" :class="$s(4)">
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

<template>
  <div
    class="border-opacity-5 absolute transform-gpu cursor-pointer overflow-hidden rounded-xl border shadow-md will-change-transform select-none hover:shadow-lg"
    :style="[cardStyle, cardStyle1]"
    @click="handleClick"
  >
    <div
      class="flex h-full w-full flex-1 items-center justify-center p-4 text-center text-base font-semibold break-words whitespace-normal text-black/72"
    >
      {{ item.content }}
    </div>
  </div>
</template>

<script setup>
import { getRandomItem } from '@/utils'
import { useId } from 'vue'
import { colors } from './data'
const id = useId()
const topId = defineModel('topId')
function handleClick() {
  console.log('id:', id, props.item)
  topId.value = id
}
const props = defineProps({
  cardStyle: {
    type: Object,
    required: true,
  },
  item: {
    type: Object,
  },
})

const zIndex = Math.floor(Math.random() * 10)
const backgroundColor = getRandomItem(colors)
const cardStyle1 = computed(() => {
  return {
    background: props.item.type === 'fixed' ? 'red' : backgroundColor,
    zIndex: topId.value === id ? 9999999 : props.item.type === 'fixed' ? 50 : zIndex,
  }
})
</script>

<style scoped></style>

<template>
  <SfViewContainer>
    <button
      class="rounded bg-gray-100 px-3 py-1 hover:bg-gray-200 hover:text-blue-600"
      @click="redraw"
    >
      重新抽取
    </button>
    <div class="mt-4 flex flex-wrap gap-1 p-1 text-[12px]">
      <div
        v-for="(item, idx) in drawn"
        :key="idx"
        class="cursor-pointer rounded px-2 py-1"
        :class="[
          item.selected ? 'bg-gray-200 text-blue-600' : 'hover:bg-gray-100 hover:text-blue-600',
        ]"
        @click="toggle(idx)"
      >
        {{ item.text }}
      </div>
    </div>
  </SfViewContainer>
</template>

<script setup>
import { ref } from 'vue'
import { list as source } from './data'
const result = ref([])
const drawAllRandom = (src) => {
  const pool = src.slice()
  result.value = []
  while (pool.length) {
    const i = Math.floor(Math.random() * pool.length)
    result.value.push({ text: pool[i], selected: false })
    pool.splice(i, 1)
  }
  return result.value
}

const drawn = ref(drawAllRandom(source))

const redraw = () => {
  drawn.value = drawAllRandom(source)
}

const toggle = (idx) => {
  const item = drawn.value[idx]
  if (item) item.selected = !item.selected
}
</script>

<style lang="scss" scoped></style>

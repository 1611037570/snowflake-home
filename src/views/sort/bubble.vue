<script setup>
const list = ref([
  {
    index: 0,
    value: 22,
  },
  {
    index: 1,
    value: 11,
  },
  {
    index: 2,
    value: 333,
  },
  {
    index: 3,
    value: 22,
  },
  {
    index: 4,
    value: 21,
  },
  {
    index: 5,
    value: 20,
  },
  {
    index: 6,
    value: 66,
  },
])
const currentIndex = ref(0)
const nextIndex = ref(1)
const loading = ref(false)
function go() {
  // 排序过程中点击按钮跳出
  if (loading.value) return
  if (nextIndex.value > list.value.length - 1) {
    currentIndex.value = 0
    nextIndex.value = 1
  }
  const currentItem = list.value[currentIndex.value]
  const nextItem = list.value[nextIndex.value]
  console.log('value', currentItem.value, nextItem.value)
  // 比较当前项和下一项的值
  if (currentItem.value > nextItem.value) {
    console.log('当前value大于下一个', currentItem.index, nextItem.index)
    const tempIndex = currentItem.index
    currentItem.index = nextItem.index
    nextItem.index = tempIndex
    setTimeout(() => {
      const tempValue = currentItem.value
      list.value[currentIndex.value].value = nextItem.value
      list.value[nextIndex.value].value = tempValue
      currentIndex.value++
      nextIndex.value++
      loading.value = false
    }, 1000)
    return
  }
  console.log('当前value小于下一个', currentItem.index, nextItem.index)
  currentIndex.value++
  nextIndex.value++
  loading.value = false
}
</script>

<template>
  <SfViewContainer title="冒泡排序">
    {{ currentIndex }} {{ nextIndex }}
    <el-button type="primary" @click="go" :disabled="loading">排序</el-button>
    {{ list }}
    <div class="relative flex h-16 w-full gap-3">
      <div
        v-for="item in list"
        :key="item.value"
        class="absolute h-16 w-12 bg-amber-300 transition-all duration-300"
        :style="{ transform: `translateX(calc(60px * ${item.index}))` }"
      >
        {{ item.value }}
      </div>
    </div>
  </SfViewContainer>
</template>

<style lang="scss" scoped></style>

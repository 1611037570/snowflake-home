<template>
  <div class="flex flex-col" v-if="list.length">
    <div
      v-for="(item, index) in list"
      :key="index"
      @click="handleClick(item, index)"
      :class="[activeClass(item), hoverClass(item)]"
      class="flex-c relative mx-1 h-8 rounded-xl"
    >
      <slot :item="item">
        {{ item.name }}
      </slot>
      <div
        v-if="activeKey && item[activeKey] == activeValue"
        class="absolute top-1/2 left-3 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-sf-theme"
      ></div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  /**
   * 激活项的键名
   */
  activeKey: {
    type: String,
    default: '',
  },
  /**
   * 激活项的值
   */
  activeValue: {},
})
const emit = defineEmits(['onClick'])
function handleClick(item, index) {
  if (item.fn) item.fn()
  emit('onClick', index)
}
/**
 * 激活项的类名
 */
function activeClass(item) {
  const name = 'text-sf-theme'
  if (item.active) {
    return name
  }
  if (props.activeKey && item[props.activeKey] == props.activeValue) {
    return name
  }
  return 'text-sf-base'
}
/**
 * 悬停项的类名
 */
function hoverClass(item) {
  const name = 'hover:bg-sf-theme-hover cursor-pointer'
  if (typeof item.hover == 'boolean') {
    return item.hover ? name : ''
  }
  return name
}
</script>

<style scoped></style>

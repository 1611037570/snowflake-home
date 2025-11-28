<template>
  <div class="w-[220px] overflow-hidden rounded-xl border border-blue-100 bg-white p-2">
    <div
      v-for="(item, index) in list"
      :key="index"
      class="menu-item group flex cursor-pointer items-center rounded-md px-3 py-2.5 text-sm transition-all duration-200 hover:bg-blue-50 hover:pl-4"
      @click="select($event, item)"
      @mousedown="select($event, item)"
    >
      <!-- 菜单项文本 -->
      <div
        class="font-medium text-gray-700 transition-colors duration-200 group-hover:text-blue-600"
      >
        {{ item[nameKey] }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  list: {
    type: Array<any>,
    default: () => [],
  },
  nameKey: {
    type: String,
    default: 'name',
  },
})
const emit = defineEmits(['select'])
const select = (event: any, item: any) => {
  event.stopPropagation()
  event.preventDefault()
  emit('select', item)
}
</script>

<style scoped></style>

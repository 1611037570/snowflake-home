<script setup>
defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  width: {
    type: String,
    default: '500px',
  },
  height: {
    type: String,
    default: '600px',
  },
})
const modelValue = defineModel('modelValue')
const searchValue = defineModel('searchValue')
const handleClick = (item) => {
  modelValue.value = item.value
}
</script>

<template>
  <div class="flex h-full">
    <div class="mr-4 flex w-[200px] flex-col">
      <div class="mb-4 flex overflow-hidden rounded-xl">
        <SfInput
          v-model="searchValue"
          placeholder="搜索"
          class="h-10 bg-sf-primary text-sf-primary"
          placeholder-class="text-sf-primary"
        >
          <template #prefix>
            <SfIcon icon="fluent:search-24-regular" class="h-4 w-4" size="4" />
          </template>
        </SfInput>
      </div>
      <ElScrollbar class="flex-1">
        <div class="rounded-xl bg-sf-primary p-2">
          <div
            v-for="(item, index) in list"
            :key="item.value"
            class="flex h-10 items-center rounded-lg px-3 py-1 text-sm transition-all duration-200"
            :class="[
              item.value === modelValue ? 'sf-theme-element' : 'hover:bg-sf-primary-hover',
              {
                'border-b border-gray-200': index !== list.length - 1, // 最后一个item不添加下边框
              },
            ]"
            @click="handleClick(item)"
          >
            {{ item.name }}
          </div>
        </div>
      </ElScrollbar>
    </div>
    <ElScrollbar :style="{ width, height }">
      <div :style="{ width, height }">
        <slot></slot>
      </div>
    </ElScrollbar>
  </div>
</template>

<style lang="scss" scoped></style>

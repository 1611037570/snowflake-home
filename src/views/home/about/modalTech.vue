<template>
  <div v-for="category in techStackList" :key="category.key">
    <h3 class="mb-4 pb-2 text-lg font-semibold text-blue-600">
      {{ category.name }}
    </h3>
    <div class="grid grid-cols-2 gap-4">
      <div
        v-for="tech in category.items"
        :key="tech.name"
        class="flex flex-col items-center justify-center rounded-lg bg-white p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
      >
        <div class="mb-2 text-3xl text-blue-700">
          <BaseIcon :icon="tech.icon" />
        </div>
        <div class="font-medium text-blue-800">{{ tech.name }}</div>
        <!-- 版本信息 -->
        <div v-if="tech.version" class="mt-1 text-sm text-gray-500">{{ tech.version }}</div>
        <!-- 描述信息 -->
        <div v-if="tech.description" class="mt-1 max-w-full truncate text-xs text-gray-500">
          {{ tech.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { techStackList } from './data'
</script>

<style scoped></style>

<template>
  <transition name="dropdown" appear>
    <div
      v-if="sourceMenuOpen"
      class="source-dropdown absolute top-full left-0 z-90 mt-3 w-[220px] overflow-hidden rounded-xl border border-blue-100 bg-white shadow-lg"
    >
      <div class="p-2">
        <div
          v-for="source in webSource"
          :key="source.type"
          class="group flex cursor-pointer items-center rounded-md px-3 py-2.5 text-sm transition-all duration-200 hover:bg-blue-50 hover:pl-4"
          @click.stop="changeSource(source)"
        >
          <el-image
            v-if="source.icon"
            :src="source.icon"
            class="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110"
          ></el-image>
          <span class="transition-colors duration-200 group-hover:text-blue-600">{{
            source.type
          }}</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup></script>

<style lang="scss" scoped></style>

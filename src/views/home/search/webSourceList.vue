<template>
  <Transition name="dropdown" appear>
    <div
      ref="sourceDropdown"
      v-if="webSourceListVisible"
      class="source-dropdown absolute top-full left-0 z-90 mt-3 w-[220px] overflow-hidden rounded-xl border border-blue-100 bg-white p-2 shadow-lg"
    >
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
  </Transition>
</template>

<script setup>
import { webSource } from '@/datas/search.data'
import { useSearchStore } from '@/stores'
import { onClickOutside } from '@vueuse/core'

const searchStore = useSearchStore()
const { webSourceListVisible, currentWebIndex } = storeToRefs(searchStore)

// 切换搜索源
const changeSource = (source) => {
  currentWebIndex.value = webSource.value.indexOf(source)
  webSourceListVisible.value = false
}
const sourceDropdown = useTemplateRef('sourceDropdown')
// 点击外部关闭搜索源列表
onClickOutside(sourceDropdown, () => {
  setTimeout(() => {
    webSourceListVisible.value = false
  }, 10)
})
</script>

<style lang="scss" scoped></style>

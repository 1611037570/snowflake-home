<script setup>
import { useRoute } from 'vue-router'
import Logo from './logo.vue'
import Main from './main/index.vue'
import Mine from './mine.vue'
import Template from './template.vue'

const navList = [
  {
    name: '首页',
    value: 'home',
  },
  {
    name: '简历模板',
    value: 'template',
  },
  {
    name: '我的简历',
    value: 'mine',
  },
]
const route = useRoute()
const activeNavIndex = ref(0)
watch(
  () => route.fullPath,
  () => {
    const type = route.query.type
    const value = Array.isArray(type) ? type[0] : type
    const index = navList.findIndex((item) => item.value === value)

    if (index !== -1) {
      activeNavIndex.value = index
    }
  },
  { immediate: true },
)
const activeValue = computed(() => {
  return navList[activeNavIndex.value].value
})
</script>

<template>
  <main
    class="relative flex min-h-screen w-full flex-col bg-[linear-gradient(90deg,rgba(15,37,60,0.42),rgba(15,37,60,0.18)),linear-gradient(118deg,#194f72_0%,#29377e_48%,#435c80_100%)] text-white"
  >
    <header
      class="relative z-5 mx-auto flex h-16 w-full max-w-[1280px] items-center gap-6 font-extrabold"
    >
      <div class="flex shrink-0 items-center gap-2.5 text-[17px] whitespace-nowrap">
        <Logo size="34" />
        <span>小羊简历</span>
      </div>

      <nav class="flex items-center gap-[30px] max-[1180px]:gap-5 max-[900px]:hidden">
        <button
          v-for="(item, index) in navList"
          :key="item.value"
          type="button"
          @click="activeNavIndex = index"
          class="cursor-pointer border-0 bg-transparent p-0 text-[15px] font-extrabold"
          :class="
            index === activeNavIndex
              ? `relative text-sf-theme after:absolute after:right-0 after:bottom-[-10px] after:left-0 after:h-[5px] after:rounded-full after:bg-sf-theme after:content-['']`
              : ' text-white'
          "
        >
          {{ item.name }}
        </button>
      </nav>

      <div class="ml-auto flex items-center gap-[18px]">
        <button type="button" class="border-0 bg-transparent p-0 text-[15px] font-extrabold">
          关于我们
        </button>
        <SfMore> </SfMore>
      </div>
    </header>

    <div class="flex h-full w-full flex-1! flex-col">
      <Main v-if="activeValue == 'home'" />
      <Template v-else-if="activeValue == 'template'" />
      <Mine v-else-if="activeValue == 'mine'" />
    </div>
  </main>
</template>

<style lang="scss" scoped></style>

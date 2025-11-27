<template>
  <div class="font-inter bg-light text-dark w-full overflow-x-hidden">
    <MyHeader />
    <Index />
    <User />
    <Shoot />
    <Project />
    <Background />
    <!-- <div
      :id="item.href"
      class="h-[1233px] w-full bg-sf-theme-hover"
      v-for="item in navList"
      :key="item.href"
    >
      {{ item.name }}
    </div> -->
  </div>
</template>

<script setup>
import Background from './components/background.vue'
import Index from './modules/index.vue'
import MyHeader from './modules/myHeader.vue'
import Project from './modules/project.vue'
import Shoot from './modules/shoot.vue'
import User from './modules/user.vue'

const navList = [
  {
    name: '关于我',
    href: 'about',
  },
  {
    name: '作品',
    href: 'work',
  },
  {
    name: '联系我',
    href: 'contact',
  },
]
</script>

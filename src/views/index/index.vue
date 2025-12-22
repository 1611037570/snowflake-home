<template>
  <div class="font-inter bg-light text-dark w-full overflow-x-hidden">
    <MyHeader />
    <Index />
    <User />
    <Shoot />
    <Project />
    <Background />
    <Thank />
    <SfBacktop />
  </div>
</template>

<script setup>
import Background from './components/background.vue'
import Index from './modules/index.vue'
import MyHeader from './modules/myHeader.vue'
import Project from './modules/project.vue'
import Shoot from './modules/shoot.vue'
import Thank from './modules/thank.vue'
import User from './modules/user.vue'

const scrollTop = ref(0)
const handleScroll = () => {
  scrollTop.value = window.scrollY
}
provide('scrollTop', scrollTop)

useEventListener(window, 'scroll', handleScroll)
</script>

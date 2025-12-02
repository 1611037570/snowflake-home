<template>
  <div class="font-inter bg-light text-dark w-full overflow-x-hidden">
    <MyHeader />
    <Index />
    <User />
    <Shoot />
    <Project />
    <Background />
    <SfFooter :gap="5" class="bg-sf-bg py-24" :banner="false" />
    <SfBacktop />
  </div>
</template>

<script setup>
import Background from './components/background.vue'
import Index from './modules/index.vue'
import MyHeader from './modules/myHeader.vue'
import Project from './modules/project.vue'
import Shoot from './modules/shoot.vue'
import User from './modules/user.vue'
</script>

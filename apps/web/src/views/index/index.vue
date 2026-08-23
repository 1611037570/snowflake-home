<template>
  <div class="font-inter bg-light text-dark w-full overflow-x-hidden">
    <MyHeader />
    <Home />
    <User />
    <Project />
    <Shoot v-if="0" />
    <History />
    <Thank />
    <SfBacktop />
  </div>
</template>

<script setup>
import { useWindowScroll } from "@vueuse/core";
import { provide } from "vue";
import MyHeader from "./modules/header/index.vue";
import History from "./modules/history.vue";
import Home from "./modules/home/index.vue";
import Project from "./modules/project.vue";
import Shoot from "./modules/shoot/index.vue";
import Thank from "./modules/thank.vue";
import User from "./modules/user.vue";

const { y: scrollTop } = useWindowScroll();
provide("scrollTop", scrollTop);
</script>

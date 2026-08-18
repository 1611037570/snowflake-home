<template>
  <SearchTitle title="关键词推荐" icon="fluent:align-left-24-filled" iconClass="text-sf-theme" />
  <SearchList :list="appSource" />
</template>

<script setup>
import { useHomeStore } from "@/stores";
import SearchList from "../searchList.vue";
import SearchTitle from "../searchTitle.vue";
const searchStore = useHomeStore();
const { appSource } = storeToRefs(searchStore);
</script>

<style lang="scss" scoped></style>

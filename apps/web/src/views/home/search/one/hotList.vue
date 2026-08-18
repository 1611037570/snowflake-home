<template>
  <SearchTitle title="热门搜索" icon="bxs:hot" iconClass="text-red-400" v-if="hotSourceVisible">
    <template #right>
      <SfTab :list="hotList" v-model="hotSource" />
    </template>
  </SearchTitle>
</template>

<script setup>
import SearchTitle from "../searchTitle.vue";

import { useHomeStore } from "@/stores";
const searchStore = useHomeStore();
const { hotSource, hotSourceVisible } = storeToRefs(searchStore);

const hotList = [
  {
    name: "百度",
    value: "百度",
  },
  {
    name: "抖音",
    value: "抖音",
  },
  {
    name: "微博",
    value: "微博",
  },
];
</script>

<style lang="scss" scoped></style>

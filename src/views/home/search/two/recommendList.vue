<template>
  <SearchTitle title="关键词推荐" icon="fluent:align-left-24-filled" iconClass="text-sf-theme" />
  <SearchList :list="appSource" />
</template>

<script setup>
import { appSource } from '@/datas/search.data'
import SearchList from '../searchList.vue'
import SearchTitle from '../searchTitle.vue'
</script>

<style lang="scss" scoped></style>

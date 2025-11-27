<script setup>
const visible = defineModel()
const list = ref([
  {
    name: '程序坞应用',
    icon: '娱乐',
  },
  {
    name: '侧边栏应用',
    icon: 'mingcute:question-line',
  },
])
</script>

<template>
  <SfModal title="应用中心" v-model="visible">
    <SfSetContainer :list="list"></SfSetContainer>
  </SfModal>
</template>

<style lang="scss" scoped></style>

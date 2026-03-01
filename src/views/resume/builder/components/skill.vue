<script setup>
const skill = defineModel('skill', {
  type: String,
  default: '',
})
</script>

<template>
  <SfCollapse>
    <SfCollapseItem title="专业技能">
      <SfWangEdit v-model="skill"></SfWangEdit>
    </SfCollapseItem>
  </SfCollapse>
</template>

<style lang="scss" scoped></style>

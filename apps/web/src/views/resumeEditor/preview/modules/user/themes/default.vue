<script setup>
import UserContact from "../components/userContact.vue";
import UserHeading from "../components/userHeading.vue";
</script>

<template>
  <!-- 默认主题：头部布局与头像位置由 UserHeading 统一控制 -->
  <div>
    <UserHeading />
    <UserContact />
  </div>
</template>

<style lang="scss" scoped></style>

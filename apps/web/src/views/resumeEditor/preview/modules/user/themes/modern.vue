<script setup>
import UserContact from "../components/userContact.vue";
import UserHeading from "../components/userHeading.vue";
</script>

<template>
  <!-- 现代主题：居中列布局，头像位置由 UserHeading 统一控制，姓名下加主题色短横线 -->
  <div>
    <UserHeading show-divider />
    <UserContact class="justify-center" />
  </div>
</template>

<style lang="scss" scoped></style>

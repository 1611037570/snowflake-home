<script setup>
import UserAvatar from "../components/userAvatar.vue";
import UserContact from "../components/userContact.vue";
import UserMeta from "../components/userMeta.vue";
import UserName from "../components/userName.vue";
</script>

<template>
  <!-- 默认主题：头像在姓名左侧，元信息撑满剩余宽度避免导出换行错位 -->
  <div>
    <div class="flex flex-wrap items-center">
      <UserAvatar class="mr-3" />
      <UserName />
      <UserMeta class="flex-1" />
    </div>
    <UserContact />
  </div>
</template>

<style lang="scss" scoped></style>

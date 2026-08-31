<script setup>
import { inject } from "vue";
import UserAvatar from "../components/userAvatar.vue";
import UserContact from "../components/userContact.vue";
import UserMeta from "../components/userMeta.vue";
import UserName from "../components/userName.vue";

const themeColor = inject("themeColor");
</script>

<template>
  <!-- 现代主题：头像与元信息居中，姓名下加主题色短横线 -->
  <div>
    <div class="flex flex-wrap flex-col items-center">
      <UserAvatar class="mb-2" />
      <UserName />
      <div class="my-1 h-1 w-10 rounded-full" :style="{ background: themeColor }"></div>
      <UserMeta class="ml-0 w-full justify-center" />
    </div>
    <UserContact class="justify-center" />
  </div>
</template>

<style lang="scss" scoped></style>

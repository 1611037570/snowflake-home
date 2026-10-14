<script setup>
import UserContact from "./userContact.vue";
import UserName from "./userName.vue";
import UserAvatar from "./userAvatar.vue";
</script>

<template>
  <!-- 姓名与现有副标题在左，现有个人信息字段与头像在右，不写入示例文案。 -->
  <div class="forest-chalk-user flex w-full min-w-0 items-end justify-between gap-9">
    <div class="min-w-0 flex-1"><UserName /></div>
    <div class="flex w-[45%] min-w-0 shrink-0 items-end justify-end gap-6">
      <UserContact class="min-w-0 flex-1" align="right" single-column-grid />
      <UserAvatar class="forest-chalk-user__avatar shrink-0" />
    </div>
  </div>
</template>

<style scoped>
/* 头像套一圈浅蓝细边，与深绿纸面上的浅蓝标题同色。 */
.forest-chalk-user__avatar { --resume-user-avatar-shadow: 0 0 0 2px #a9d1e2; }
</style>

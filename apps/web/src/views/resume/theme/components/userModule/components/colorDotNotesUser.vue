<script setup>
import UserName from "./userName.vue";
import UserContact from "./userContact.vue";
import UserAvatar from "./userAvatar.vue";
</script>

<template>
  <!-- 个人信息整块排在顶部：左侧姓名便签，右侧联系资料，几何装饰与头像同处右端装饰带。 -->
  <div class="color-dot-notes-user relative flex w-full min-w-0 items-center justify-between gap-9">
    <div
      class="color-dot-notes-user__name relative max-w-[52%] min-w-0 rotate-[-2deg] bg-[#FFDD62] px-6 py-3 font-black text-[#171717]"
    >
      <UserName />
    </div>
    <div class="relative flex min-w-0 flex-1 items-center justify-end gap-6">
      <UserContact class="min-w-0 flex-1 text-[13px] leading-[1.5]" align="right" />
      <!-- 装饰带固定占位，头像缺失时资料也不会顶到几何图形上。 -->
      <div
        class="color-dot-notes-user__edge relative flex w-[96px] shrink-0 items-center justify-center"
      >
        <span
          aria-hidden="true"
          class="absolute top-[-20px] left-[-16px] size-[72px] rounded-full bg-[#FFE279]"
        />
        <span
          aria-hidden="true"
          class="absolute top-[-6px] right-[-16px] h-[90px] w-[9px] rotate-[-29deg] bg-[#F7AA60]"
        />
        <span
          aria-hidden="true"
          class="absolute bottom-[-20px] left-[-8px] h-[54px] w-[54px] rotate-[-15deg] bg-[#F58F91]"
          style="clip-path: polygon(50% 0, 100% 100%, 0 100%)"
        />
        <UserAvatar class="color-dot-notes-user__avatar relative shrink-0" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 姓名沿用便签上的粗黑倾斜排版，副标题改用红色形成第二层级。 */
.color-dot-notes-user__name {
  --resume-user-name-size: 43px;
  --resume-user-name-line-height: 1.15;
  --resume-user-name-spacing: 0.12em;
  --resume-user-subtitle-color: #f16e68;
  --resume-user-subtitle-size: 19px;
  --resume-user-subtitle-weight: 700;
  --resume-user-subtitle-spacing: 0.1em;
}
/* 头像裁成圆形并套上白蓝双层便签边框，压在黄色圆点底衬上。 */
.color-dot-notes-user__avatar {
  --resume-user-avatar-width: 96px;
  --resume-user-avatar-height: 96px;
  --resume-user-avatar-radius: 9999px;
  --resume-user-avatar-shadow: 0 0 0 4px #ffffff, 0 0 0 7px #78b8f7;
}
</style>

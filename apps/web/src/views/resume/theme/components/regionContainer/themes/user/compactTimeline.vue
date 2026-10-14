<template>
  <!-- 个人信息沿用公共组件，只用姓名、头像和底线呼应年表配色。 -->
  <div class="compact-timeline-user relative flex w-full min-w-0">
    <slot />
  </div>
</template>

<style scoped>
.compact-timeline-user {
  --resume-user-name-size: 40px;
  --resume-user-name-line-height: 1.1;
  --resume-user-name-color: #465b42;
  --resume-user-avatar-width: 100px;
  --resume-user-avatar-height: 100px;
  --resume-user-avatar-radius: 50%;
  --resume-user-subtitle-color: #596a55;
}

/* 页眉收口线改用独立绘制层贴合区域底边：box-shadow 内阴影在缩放预览下会在左右两侧露出 1px 细边。 */
.compact-timeline-user::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: #596a55;
  pointer-events: none;
}
</style>

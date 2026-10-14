<template>
  <!-- 页眉背景贴到纸张顶边，正文仍由公共区域间距隔开。 -->
  <div
    class="mint-cards-user relative flex w-full min-w-0 overflow-hidden rounded-b-[36px] text-white"
  >
    <slot />
  </div>
</template>

<style scoped>
.mint-cards-user {
  background-image:
    radial-gradient(circle 100px at 83% 3%, rgba(135, 250, 220, 0.24) 99%, transparent 100%),
    radial-gradient(circle 66px at 98% 100%, rgba(167, 255, 229, 0.22) 99%, transparent 100%),
    linear-gradient(108deg, #108a7f 0%, #13ad9e 58%, #3ad9c8 100%);
  --resume-user-name-size: 38px; /* 姓名字号 */
  --resume-user-name-color: #ffffff; /* 姓名颜色 */
  --resume-user-subtitle-color: #f2fffb; /* 副标题颜色 */
  --resume-user-contact-label-color: #e6fff9; /* 资料标签颜色 */
}
</style>

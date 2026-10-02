<script>
// 页眉留白由组件声明，分页按相同尺寸测量。
const regionPadding = {
  top: 42, // 页眉顶部留白
  right: 48, // 页眉右侧留白
  bottom: 0, // 页眉底部与正文容器贴合
  left: 48, // 页眉左侧留白
};
export default {
  regionPadding, // 个人信息区域内部留白
  fillsPageTop: true, // 首页页眉从纸张顶边开始
};
</script>

<template>
  <!-- 页眉使用纸张背景，装饰文字不占个人信息布局。 -->
  <div
    class="relative box-border flex w-full min-w-0 overflow-hidden px-12 pt-[42px] text-white"
  >
    <span aria-hidden="true" class="pointer-events-none absolute top-6 right-9 text-right text-4xl leading-none font-black tracking-wide text-white/20">
      BIOGRAPHICAL<br />NOTES
    </span>
    <slot />
  </div>
</template>

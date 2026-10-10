<template>
  <!-- 页眉资料使用黑色文字，装饰文字不占个人信息布局。 -->
  <div
    class="relative box-border flex w-full min-w-0 overflow-hidden text-black"
  >
    <span aria-hidden="true" class="pointer-events-none absolute top-6 right-9 text-right text-4xl leading-none font-black tracking-wide text-white/20">
      BIOGRAPHICAL<br />NOTES
    </span>
    <slot />
  </div>
</template>

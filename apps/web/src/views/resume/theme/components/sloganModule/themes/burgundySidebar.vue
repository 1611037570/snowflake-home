<template>
  <!-- 绛红色带只绘制装饰，内容节点负责占据页面内容区内的剩余高度。 -->
  <div aria-hidden="true" class="burgundy-band-space w-full" />
</template>

<style scoped>
.burgundy-band-space {
  height: max(0px, calc(var(--burgundy-band-height) - var(--burgundy-band-page-top)));
}
</style>

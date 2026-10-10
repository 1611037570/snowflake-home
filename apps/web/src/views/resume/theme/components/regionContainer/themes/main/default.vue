<template>
  <!-- 正文区域始终由同一容器承载，顶部留白由组件声明统一下发。 -->
  <div class="resume-view-container relative box-border flex min-w-0 bg-transparent text-inherit">
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>

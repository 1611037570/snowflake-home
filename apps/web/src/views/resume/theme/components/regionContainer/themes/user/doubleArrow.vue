<script>
// 页眉区域容器不施加内边距，留白由组件声明并在模板上用等值类表达。
const regionPadding = {
  top: 36, // 个人信息上方的留白，与模板 pt-9 一致
  right: 24, // 与模板 px-6 一致，箭头引导符右侧留白
  bottom: 24, // 个人信息与正文之间的留白，与模板 pb-6 一致
  left: 24, // 与模板 px-6 一致，箭头引导符左侧留白
};
export default {
  regionPadding, // 分页与组件共用的页眉留白
};
</script>

<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();
</script>

<template>
  <!-- 页眉只承载个人信息，装饰一律绝对定位，不挤压头像与信息栏。 -->
  <div
    class="double-arrow-user relative w-full min-w-0 px-6 pt-9 pb-6"
    :style="{ '--double-arrow-user-accent': themeColor, '--double-arrow-user-line': themeColorLine }"
  >
    <slot />
    <!-- 页眉右下的双箭头引导符：与模块标题的双三角、正文右缘的箭头列同向。 -->
    <span aria-hidden="true" class="double-arrow-user__mark" />
  </div>
</template>

<style scoped>
/* 引导符落在页眉右下角，只占装饰尺寸，随内容高度自然贴底。 */
.double-arrow-user__mark {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 18px;
  height: 14px;
  background-color: var(--double-arrow-user-accent);
  clip-path: polygon(
    0 0,
    45% 0,
    100% 50%,
    45% 100%,
    0 100%,
    55% 50%
  );
  opacity: 0.9;
  pointer-events: none;
}

/* 引导符左侧接一条细分隔线，提示正文栏的贯穿引导线由此开始。 */
.double-arrow-user__mark::before {
  content: "";
  position: absolute;
  top: 50%;
  right: 100%;
  width: 72px;
  height: 1px;
  background-color: var(--double-arrow-user-line);
  pointer-events: none;
}
</style>

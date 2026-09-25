<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

// 跳转地址由调用方指定，默认回到我的简历
const props = defineProps({
  url: { type: String, default: "/resume/mine" },
});

// 统一简历模块入口，复用项目标识与返回行为
const handleBack = () => {
  router.push(props.url);
};
</script>

<template>
  <!-- 悬停提示：引导用户收藏本站 -->
  <SfTooltip content="按「Ctrl+D」收藏本站或拖动LOGO到书签栏" placement="bottom">
    <div
      class="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-sf-theme transition-all hover:bg-sf-theme-3"
      @click="handleBack"
    >
      <SfLogo size="5.5" class="animate-pulse" name="resume" />

      <span class="hidden text-base font-bold tracking-wide md:flex">{{
        $t("core.router.resume")
      }}</span>
    </div>
  </SfTooltip>
</template>

<script setup>
import ProjectTitle from "../components/projectTitle.vue";
import GithubStars from "../components/githubStars.vue";
</script>

<template>
  <!-- 首页顶部只保留品牌与右侧入口，栏目导航统一由工作区侧栏承担。 -->
  <header
    class="fixed top-0 right-0 left-0 z-50 h-12 w-full border-b-[0.5px] border-sf-b bg-sf-primary text-sf-text"
  >
    <div class="mx-auto flex h-full w-full max-w-7xl items-center gap-3 px-3">
      <!-- 品牌保持静态，移动端也保留标识，文字仍沿用组件的响应式显示。 -->
      <ProjectTitle
        class="flex shrink-0 [&_.animate-pulse]:animate-none [&_a]:gap-3 [&_a]:rounded-none [&_a]:px-0 [&_a]:hover:bg-transparent [&_a>span]:font-semibold [&_a>span]:tracking-normal"
        url="/resume"
      />

      <!-- 使用图标盒子承担完整交互区域，避免缩放后触发范围与悬停背景不一致。 -->
      <div class="ml-auto flex shrink-0 items-center gap-[3px] border-l border-sf-b pl-3 sm:gap-3">
        <GithubStars size="6" :box-size="9" class="rounded-lg" />
        <SfTheme size="6" :box-size="9" class="flex h-9 w-9 items-center justify-center" />
        <SfLocale size="6" :box-size="9" class="flex h-9 w-9 items-center justify-center" />
        <SfDonation size="6" :box-size="9" class="h-9 w-9 cursor-pointer justify-center" />
        <!-- 主要入口固定在右侧，直接进入我的简历。 -->
        <router-link
          to="/resume/mine"
          class="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-sf-theme px-3 text-sm font-semibold text-sf-theme-text transition-colors duration-300 hover:bg-sf-theme-2"
        >
          {{ $t("resumeHomeStartUse") }}
        </router-link>
      </div>
    </div>
  </header>
</template>

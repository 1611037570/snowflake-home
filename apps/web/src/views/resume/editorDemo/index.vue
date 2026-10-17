<script setup>
// 左栏重构静态视觉 Demo：只有排版与状态呈现，不包含任何实际功能
import LeftPanel from "./leftPanel.vue";
import PaperPreview from "./paperPreview.vue";

/** 演示顶栏图例：说明主题色与阴影的语义 */
const legend = [
  { key: "current", label: "主题色 = 当前项 / 主操作" },
  { key: "editing", label: "左竖条 = 正在编辑" },
  { key: "shadow", label: "阴影 = 层级，不用描边" },
];
</script>

<template>
  <div class="h-svh w-full overflow-y-auto bg-sf-page text-sf-text">
    <div class="flex h-svh flex-col">
      <!-- 演示顶栏：说明当前看的是哪一版左栏 -->
      <header
        class="flex h-12 shrink-0 items-center justify-between border-b border-sf-b bg-sf-primary px-3"
      >
        <div class="flex min-w-0 items-center gap-3">
          <span
            class="rounded-full bg-sf-theme-3 px-1.5 py-1.5 text-[11px] font-semibold tracking-wider text-sf-theme"
            >DEMO</span
          >
          <h1 class="truncate text-[13px] font-semibold">左栏重构：模块树 + 文档流</h1>
          <span class="hidden text-[11px] text-sf-text-3 lg:block">
            静态视觉稿，用于判断密度、层级与动线；表单内容为演示数据
          </span>
        </div>
        <div class="flex shrink-0 items-center gap-3 text-[11px] text-sf-text-3">
          <span v-for="item in legend" :key="item.key" class="hidden items-center gap-1.5 md:flex">
            <span
              class="h-2 w-2 rounded-full"
              :class="item.key === 'shadow' ? 'bg-sf-bg-3' : 'bg-sf-theme'"
            ></span>
            {{ item.label }}
          </span>
        </div>
      </header>

      <!-- 工作区：左侧新左栏，右侧画布 -->
      <div class="flex min-h-0 flex-1">
        <LeftPanel />
        <PaperPreview />
      </div>
    </div>

    <!-- 状态标本：静态罗列关键状态与新规格，方便一次看完 -->
    <section class="mx-auto w-full max-w-[1440px] px-6 py-9">
      <div class="flex flex-col gap-1.5">
        <h2 class="text-lg font-bold">状态标本与规格</h2>
        <p class="text-[12px] text-sf-text-2">
          四种卡片状态、模块树的四种状态，以及圆角与字阶的收敛结果。
        </p>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- 卡片状态 -->
        <article class="rounded-xl border border-sf-b bg-sf-primary p-3">
          <h3 class="text-[13px] font-semibold">卡片状态</h3>
          <div class="mt-3 flex flex-col gap-3">
            <div class="rounded-xl bg-sf-bg px-3 py-3">
              <p class="mb-1.5 text-[11px] text-sf-text-3">常态（hover 抬升阴影并显示操作）</p>
              <div class="spec-card">
                <div class="flex h-9 items-center gap-1.5 px-3">
                  <SfIcon icon="icon-park-outline:drag" size="4" class="text-sf-text-3" />
                  <span class="text-[13px] font-semibold">工作经历</span>
                  <SfIcon icon="ph:caret-down-bold" size="3" class="ml-auto text-sf-text-3" />
                </div>
              </div>
            </div>
            <div class="rounded-xl bg-sf-bg px-3 py-3">
              <p class="mb-1.5 text-[11px] text-sf-text-3">正在编辑（左缘 3px 竖条）</p>
              <div class="spec-card spec-card--editing">
                <div class="flex h-9 items-center gap-1.5 px-3">
                  <span class="text-[13px] font-semibold">个人信息</span>
                  <SfIcon icon="ph:caret-down-bold" size="3" class="ml-auto text-sf-text-3" />
                </div>
              </div>
            </div>
            <div class="rounded-xl bg-sf-bg px-3 py-3">
              <p class="mb-1.5 text-[11px] text-sf-text-3">定位命中（2px 主题色环，闪两次）</p>
              <div class="spec-card spec-card--selected">
                <div class="flex h-9 items-center gap-1.5 px-3">
                  <span class="text-[13px] font-semibold">教育经历</span>
                  <SfIcon icon="ph:caret-down-bold" size="3" class="ml-auto text-sf-text-3" />
                </div>
              </div>
            </div>
            <div class="rounded-xl bg-sf-bg px-3 py-3">
              <p class="mb-1.5 text-[11px] text-sf-text-3">隐藏（降透明度 + 标题删除线）</p>
              <div class="spec-card opacity-60">
                <div class="flex h-9 items-center gap-1.5 px-3">
                  <span class="text-[13px] font-semibold line-through">荣誉证书</span>
                  <SfIcon icon="lucide:eye" size="4" class="ml-auto text-sf-text-3" />
                </div>
              </div>
            </div>
          </div>
        </article>

        <!-- 模块树状态 -->
        <article class="rounded-xl border border-sf-b bg-sf-primary p-3">
          <h3 class="text-[13px] font-semibold">模块树状态</h3>
          <div class="mt-3 rounded-xl bg-sf-primary px-3 py-3">
            <div class="flex w-38 flex-col gap-1.5">
              <div class="flex h-8 items-center gap-1 rounded-3xl p-1 text-sf-text-2">
                <SfIcon icon="mdi:school-outline" size="4" />
                <span class="max-w-21 truncate text-[12px]">教育经历</span>
                <span
                  class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-sf-bg-2 px-1 text-[11px] leading-none tabular-nums text-sf-text-3"
                  >1</span
                >
              </div>
              <div class="flex h-8 items-center gap-1 rounded-3xl bg-sf-bg p-1 text-sf-text-2">
                <SfIcon icon="icon-park-outline:drag" size="4" class="text-sf-text-3" />
                <span class="max-w-21 truncate text-[12px]">教育经历</span>
                <span
                  class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-sf-bg-2 px-1 text-[11px] leading-none tabular-nums text-sf-text-3"
                  >1</span
                >
              </div>
              <div class="flex h-8 items-center gap-1 rounded-3xl bg-sf-theme-3 p-1 text-sf-theme">
                <SfIcon icon="lucide:briefcase" size="4" />
                <span class="max-w-21 truncate text-[12px]">工作经历</span>
                <span
                  class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-sf-theme px-1 text-[11px] leading-none tabular-nums text-sf-theme-text"
                  >3</span
                >
              </div>
              <div class="flex h-8 items-center gap-1 rounded-3xl p-1 text-sf-text-3">
                <SfIcon icon="fa6-solid:award" size="4" />
                <span class="max-w-21 truncate text-[12px]">荣誉证书</span>
                <span class="ml-auto h-1.5 w-1.5 rounded-full bg-sf-text-3"></span>
              </div>
            </div>
          </div>
          <p class="mt-3 text-[11px] leading-5 text-sf-text-2">
            模块树底色与顶部导航栏一致；行本身无底色，hover 为浅灰、当前项为主题色浅底；右侧记录数量用圆形徽标。
          </p>
        </article>

        <!-- 圆角与字阶 -->
        <article class="rounded-xl border border-sf-b bg-sf-primary p-3">
          <h3 class="text-[13px] font-semibold">圆角与字阶</h3>
          <div class="mt-3 flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div class="flex h-9 flex-1 items-center rounded-3xl border border-sf-b px-3 text-[12px] text-sf-text-2">
                旧：24px 圆角
              </div>
              <div class="flex h-9 flex-1 items-center rounded-xl border border-sf-b px-3 text-[12px] text-sf-text">
                新：12px 圆角
              </div>
            </div>
            <div class="flex flex-col gap-1.5 rounded-xl bg-sf-bg px-3 py-3">
              <span class="text-[15px] font-semibold">15 卡片标题 / 模块名</span>
              <span class="text-[13px]">13 记录标题 / 控件文字</span>
              <span class="text-[12px] text-sf-text-2">12 字段标签</span>
              <span class="text-[11px] text-sf-text-3">11 辅助说明（取消 9px）</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 标本卡片：与文档流同一套阴影语言 */
.spec-card {
  overflow: hidden;
  border-radius: 12px;
  background: var(--sf-primary);
  box-shadow:
    0 1px 2px color-mix(in srgb, var(--sf-base) 6%, transparent),
    0 6px 16px color-mix(in srgb, var(--sf-base) 4%, transparent);
}

/* 定位命中：主题色描边闪烁两次后停住，鼠标进入即清除（真实实现） */
.spec-card--selected {
  animation: demo-ring 0.6s ease-in-out 2;
  outline: 2px solid var(--sf-theme);
  outline-offset: -2px;
}

@keyframes demo-ring {
  0%,
  100% {
    outline-color: var(--sf-theme);
  }
  50% {
    outline-color: transparent;
  }
}

/* 正在编辑：左缘竖条，与文档流卡片一致 */
.spec-card--editing {
  position: relative;
}

.spec-card--editing::before {
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: 0;
  width: 3px;
  border-radius: 0 9999px 9999px 0;
  background: var(--sf-theme);
  content: "";
}
</style>

<script setup lang="ts">
import { useIntersectionObserver } from "@vueuse/core";
import type { ComponentPublicInstance } from "vue";
import { ref } from "vue";

import { jobGuideList } from "./data";

const activeGuideIndex = ref(0);
const mobileDirectory = ref<HTMLDetailsElement | null>(null);
const guideSectionList = ref<HTMLElement[]>([]);

// 记录分类节点，供滚动观察同步左侧高亮。
function setGuideSection(element: Element | ComponentPublicInstance | null, index: number) {
  if (element instanceof HTMLElement) guideSectionList.value[index] = element;
}

// 分类进入页面上方阅读区域时更新目录选中项。
useIntersectionObserver(
  guideSectionList,
  (entries) => {
    const currentEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top)[0];
    if (!currentEntry) return;

    const currentIndex = guideSectionList.value.indexOf(currentEntry.target as HTMLElement);
    if (currentIndex >= 0) activeGuideIndex.value = currentIndex;
  },
  {
    rootMargin: "-12px 0px -75% 0px", // 只以页面上方阅读区域判断当前分类。
  },
);

// 切换目录时定位到对应分类，并收起移动端目录。
function scrollToGuide(index: number) {
  activeGuideIndex.value = index;
  mobileDirectory.value?.removeAttribute("open");
  document
    .getElementById(`guide-section-${index}`)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}
</script>

<template>
  <SfScrollbar class="h-full bg-sf-page" flush>
    <main class="mx-auto w-full max-w-7xl p-3 text-sf-text">
      <!-- 页头统一使用正文色标题与次级说明，不额外展示栏目小字。 -->
      <header>
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-lg font-semibold text-sf-text">{{ $t("resumeGuideTitle") }}</h1>
        </div>
        <p class="mt-[6px] max-w-3xl text-xs leading-6 text-sf-text-2">
          {{ $t("resumeGuideDescription") }}
        </p>
      </header>

      <section
        class="mt-3 grid items-start gap-3 lg:grid-cols-[12rem_minmax(0,1fr)]"
      >
        <!-- 目录保持吸顶，窄屏继续使用原有折叠入口。 -->
        <aside class="sticky top-3 z-10 self-start">
          <nav
            class="rounded-xl border border-sf-b bg-sf-primary p-3 lg:max-h-[calc(100svh-96px)] lg:overflow-y-auto"
            :aria-label="$t('resumeGuideDirectory')"
          >
            <details ref="mobileDirectory" class="lg:hidden">
              <summary
                class="cursor-pointer rounded-lg px-3 py-[6px] text-sm font-medium text-sf-text transition-colors hover:bg-sf-bg"
              >
                {{ jobGuideList[activeGuideIndex]?.name }}
              </summary>
              <ul class="mt-3 max-h-[60svh] overflow-y-auto">
                <li v-for="(guide, guideIndex) in jobGuideList" :key="guide.name">
                  <button
                    type="button"
                    class="flex min-h-9 w-full cursor-pointer items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-[6px] text-left text-sm transition-colors hover:bg-sf-bg"
                    :class="
                      activeGuideIndex === guideIndex
                        ? 'bg-sf-theme-3 font-medium text-sf-theme'
                        : 'font-normal text-sf-text-2'
                    "
                    :aria-current="activeGuideIndex === guideIndex ? 'true' : undefined"
                    @click="scrollToGuide(guideIndex)"
                  >
                    <span>{{ guide.name }}</span>
                    <span class="text-xs font-normal text-sf-text-3 tabular-nums">{{ guide.list.length }}</span>
                  </button>
                </li>
              </ul>
            </details>

            <div class="hidden lg:block">
              <p class="border-b border-sf-b px-3 pb-3 text-xs text-sf-text-3">{{ $t("resumeGuideDirectory") }}</p>
              <ul class="mt-3">
                <li v-for="(guide, guideIndex) in jobGuideList" :key="guide.name">
                  <button
                    type="button"
                    class="flex min-h-9 w-full cursor-pointer items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-[6px] text-left text-sm transition-colors hover:bg-sf-bg"
                    :class="
                      activeGuideIndex === guideIndex
                        ? 'bg-sf-theme-3 font-medium text-sf-theme'
                        : 'font-normal text-sf-text-2'
                    "
                    :aria-current="activeGuideIndex === guideIndex ? 'true' : undefined"
                    @click="scrollToGuide(guideIndex)"
                  >
                    <span>{{ guide.name }}</span>
                    <span class="text-xs font-normal text-sf-text-3 tabular-nums">{{ guide.list.length }}</span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        <article class="min-w-0">
          <section
            v-for="(guide, guideIndex) in jobGuideList"
            :id="`guide-section-${guideIndex}`"
            :ref="(element) => setGuideSection(element, guideIndex)"
            :key="guide.name"
            class="scroll-mt-3 pb-3"
            :aria-labelledby="`guide-heading-${guideIndex}`"
          >
            <!-- 章节名称与数量分层，正文仍保留独立卡片。 -->
            <h2
              :id="`guide-heading-${guideIndex}`"
              class="flex items-center gap-3 border-b border-sf-b pb-3 text-base font-semibold text-sf-text"
            >
              <span>{{ guide.name }}</span>
              <span class="rounded bg-sf-primary px-[6px] py-[3px] text-xs font-normal text-sf-text-3 tabular-nums">
                {{ guide.list.length }}条
              </span>
            </h2>
            <ol class="mt-3 grid gap-3 md:grid-cols-2">
              <li v-for="item in guide.list" :key="item.title" class="h-full">
                <section
                  class="h-full rounded-xl border border-sf-b bg-sf-primary p-3 transition-colors hover:border-sf-theme"
                >
                  <h3 class="text-sm leading-6 font-medium text-sf-text">{{ item.title }}</h3>
                  <p class="mt-[6px] text-sm leading-6 text-sf-text-2">{{ item.content }}</p>
                </section>
              </li>
            </ol>
          </section>

          <footer
            class="rounded-xl border border-sf-b bg-sf-primary p-3 text-xs leading-6 text-sf-text-2"
          >
            <p class="font-semibold text-sf-text">
              {{ $t("resumeGuideDisclaimerTitle") }}
            </p>
            <p class="mt-3">{{ $t("resumeGuideDisclaimer") }}</p>
          </footer>
        </article>
      </section>
    </main>
  </SfScrollbar>
</template>

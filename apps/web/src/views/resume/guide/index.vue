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
    <main class="mx-auto w-full max-w-screen-xl px-3 pt-3 text-sf-text sm:px-3">
      <header>
        <p class="text-sm font-semibold text-sf-theme">
          {{ $t("resumeGuideEyebrow") }}
        </p>
        <h1 class="mt-3 text-3xl font-black">
          {{ $t("resumeGuideTitle") }}
        </h1>
        <p class="mt-3 max-w-3xl leading-normal text-sf-text-2">
          {{ $t("resumeGuideDescription") }}
        </p>
      </header>

      <section
        class="mt-3 grid items-start gap-3 lg:grid-cols-[9rem_minmax(0,1fr)]"
      >
        <aside class="sticky top-3 self-start">
          <nav
            class="rounded-3xl border border-sf-b bg-sf-primary p-3 lg:max-h-screen lg:overflow-y-auto"
            :aria-label="$t('resumeGuideDirectory')"
          >
            <details ref="mobileDirectory" class="lg:hidden">
              <summary
                class="cursor-pointer rounded-xl p-3 font-semibold text-sf-text transition-colors hover:bg-sf-bg"
              >
                {{ jobGuideList[activeGuideIndex]?.name }}
              </summary>
              <ul class="mt-3 max-h-screen overflow-y-auto">
                <li v-for="(guide, guideIndex) in jobGuideList" :key="guide.name">
                  <button
                    type="button"
                    class="w-full cursor-pointer whitespace-nowrap rounded-xl p-3 text-left text-sm font-semibold transition-colors hover:bg-sf-bg"
                    :class="
                      activeGuideIndex === guideIndex
                        ? 'bg-sf-theme-3 text-sf-theme'
                        : 'text-sf-text-2'
                    "
                    :aria-current="activeGuideIndex === guideIndex ? 'true' : undefined"
                    @click="scrollToGuide(guideIndex)"
                  >
                    {{ guide.name }}
                  </button>
                </li>
              </ul>
            </details>

            <div class="hidden lg:block">
              <ul>
                <li v-for="(guide, guideIndex) in jobGuideList" :key="guide.name">
                  <button
                    type="button"
                    class="w-full cursor-pointer whitespace-nowrap rounded-xl p-3 text-left text-sm font-semibold transition-colors hover:bg-sf-bg"
                    :class="
                      activeGuideIndex === guideIndex
                        ? 'bg-sf-theme-3 text-sf-theme'
                        : 'text-sf-text-2'
                    "
                    :aria-current="activeGuideIndex === guideIndex ? 'true' : undefined"
                    @click="scrollToGuide(guideIndex)"
                  >
                    {{ guide.name }}
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
            <h2
              :id="`guide-heading-${guideIndex}`"
              class="flex items-center gap-3 text-3xl font-black text-sf-theme"
            >
              <span>{{ guide.name }}</span>
              <span class="rounded-full bg-sf-theme-3 px-3 text-sm font-semibold">
                {{ guide.list.length }}条
              </span>
            </h2>
            <ol class="mt-3 grid gap-3 md:grid-cols-2">
              <li v-for="item in guide.list" :key="item.title" class="h-full">
                <section
                  class="h-full rounded-3xl border border-sf-b bg-sf-primary p-3 transition-colors hover:border-sf-theme hover:bg-sf-bg"
                >
                  <h3 class="pb-1 text-lg font-bold text-sf-text">{{ item.title }}</h3>
                  <p class="leading-normal text-sf-text-2">{{ item.content }}</p>
                </section>
              </li>
            </ol>
          </section>

          <footer
            class="rounded-3xl border border-sf-b bg-sf-primary p-3 text-xs leading-normal text-sf-text-2"
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

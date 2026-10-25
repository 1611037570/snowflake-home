<script setup lang="ts">
import { ref } from "vue";

import { jobGuideList } from "./data";

const activeGuideIndex = ref(0);
const mobileDirectory = ref<HTMLDetailsElement | null>(null);

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
    <main class="mx-auto w-full max-w-screen-xl px-3 text-sf-text sm:px-3">
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
        class="mt-3 grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]"
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
              <ul class="mt-3 max-h-screen space-y-3 overflow-y-auto">
                <li v-for="(guide, guideIndex) in jobGuideList" :key="guide.name">
                  <button
                    type="button"
                    class="w-full cursor-pointer rounded-xl p-3 text-left text-sm font-semibold transition-colors hover:bg-sf-bg"
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
              <ul class="space-y-3">
                <li v-for="(guide, guideIndex) in jobGuideList" :key="guide.name">
                  <button
                    type="button"
                    class="w-full cursor-pointer rounded-xl p-3 text-left text-sm font-semibold transition-colors hover:bg-sf-bg"
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
            :key="guide.name"
            class="scroll-mt-3 pb-3"
            :aria-labelledby="`guide-heading-${guideIndex}`"
          >
            <h2
              :id="`guide-heading-${guideIndex}`"
              class="text-3xl font-black text-sf-theme"
            >
              {{ guide.name }}
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
        </article>
      </section>
    </main>
  </SfScrollbar>
</template>

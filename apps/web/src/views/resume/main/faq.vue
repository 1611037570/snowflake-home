<script setup>
import { $t } from "@/locales";
import { computed, reactive } from "vue";

// 常见问题：默认收起，逐条展开，避免长文案把首页撑得太长
const faqList = computed(() => [
  {
    id: "free",
    question: $t("resumeHomeFaqQuestion1"),
    answer: $t("resumeHomeFaqAnswer1"),
  },
  {
    id: "dataSecurity",
    question: $t("resumeHomeFaqQuestion2"),
    answer: $t("resumeHomeFaqAnswer2"),
  },
  {
    id: "exportFormat",
    question: $t("resumeHomeFaqQuestion3"),
    answer: $t("resumeHomeFaqAnswer3"),
  },
  {
    id: "customization",
    question: $t("resumeHomeFaqQuestion4"),
    answer: $t("resumeHomeFaqAnswer4"),
  },
  {
    id: "language",
    question: $t("resumeHomeFaqQuestion5"),
    answer: $t("resumeHomeFaqAnswer5"),
  },
]);

// 每条问答独立记录展开状态，互不影响
const openedMap = reactive({});

const toggleItem = (id) => {
  openedMap[id] = !openedMap[id];
};

// 展开动画需要知道内容实际高度，直接用裁剪容器的高度过渡
const beforeEnter = (element) => {
  element.style.height = "0";
};

const enter = (element) => {
  element.style.height = `${element.scrollHeight}px`;
};

const afterEnter = (element) => {
  // 动画结束后交还高度，内容换行或字体变化都不会被裁剪
  element.style.height = "auto";
};

const beforeLeave = (element) => {
  element.style.height = `${element.scrollHeight}px`;
};

const leave = (element) => {
  // 先落到实际高度再收到零，避免从 auto 无法过渡
  element.offsetHeight;
  element.style.height = "0";
};
</script>

<template>
  <section class="mx-auto flex max-w-[1440px] flex-col gap-9 px-6 py-6 lg:px-12">
    <div class="max-w-2xl">
      <p class="text-sm font-semibold tracking-[0.18em] text-sf-theme">
        {{ $t("resumeHomeFaqEyebrow") }}
      </p>
      <h2 class="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
        {{ $t("resumeHomeFaqTitle") }}
      </h2>
      <p class="mt-3 leading-7 text-sf-text-2">{{ $t("resumeHomeFaqDescription") }}</p>
    </div>
    <!-- 折叠容器限宽居中，正文行长保持在易读范围 -->
    <div class="mx-auto w-full max-w-3xl">
      <div
        v-for="item in faqList"
        :key="item.id"
        class="mb-3 overflow-hidden rounded-3xl border border-sf-b bg-sf-primary"
      >
        <h3>
          <button
            type="button"
            class="flex w-full cursor-pointer items-center justify-between gap-3 p-3 text-left text-base font-bold"
            :aria-expanded="Boolean(openedMap[item.id])"
            :aria-controls="`resume-faq-panel-${item.id}`"
            @click="toggleItem(item.id)"
          >
            <span class="flex items-start gap-3">
              <SfIcon
                icon="mingcute:question-line"
                size="5"
                class="mt-0.5 shrink-0 text-sf-theme"
              />
              {{ item.question }}
            </span>
            <SfIcon
              icon="mingcute:down-line"
              size="5"
              class="shrink-0 text-sf-text-3 transition-transform duration-300"
              :class="{ '-rotate-90': !openedMap[item.id] }"
            />
          </button>
        </h3>
        <Transition
          name="faq-panel"
          @before-enter="beforeEnter"
          @enter="enter"
          @after-enter="afterEnter"
          @before-leave="beforeLeave"
          @leave="leave"
        >
          <div
            v-show="openedMap[item.id]"
            :id="`resume-faq-panel-${item.id}`"
            class="overflow-hidden"
          >
            <p class="p-3 leading-7 text-sf-text-2">
              {{ item.answer }}
            </p>
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 折叠面板用高度过渡，配合脚本钩子实现内容自适应 */
.faq-panel-enter-active,
.faq-panel-leave-active {
  transition: height 0.3s ease-out;
}
</style>

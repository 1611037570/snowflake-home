<script setup lang="ts">
import { computed, ref } from "vue";

import { resignationScoreList, resignationScoreResults } from "./data";

const selectedScores = ref<Array<number | null>>(resignationScoreList.map(() => null));
const showResult = ref(false);
const activeItemIndex = ref(0);

const completedCount = computed(
  () => selectedScores.value.filter((score) => score !== null).length,
);
const activeScoreItem = computed(() => resignationScoreList[activeItemIndex.value]!);
const totalScore = computed(() =>
  selectedScores.value.reduce<number>((total, score) => total + (score ?? 0), 0),
);
const isCompleted = computed(() => completedCount.value === resignationScoreList.length);
const scoreResult = computed(() => {
  if (!isCompleted.value) return null;
  return resignationScoreResults.find(
    (result) => totalScore.value >= result.minScore && totalScore.value <= result.maxScore,
  );
});

// 记录每项选择，并在答案变化后收起上一份成绩。
function selectScore(itemIndex: number, score: number) {
  selectedScores.value[itemIndex] = score;
  showResult.value = false;
}

// 切换当前评分项，已填写内容继续保留。
function switchScoreItem(itemIndex: number) {
  activeItemIndex.value = itemIndex;
}

// 全部完成后由用户主动查看成绩，避免提前展示未完成的总分。
function viewScoreResult() {
  if (isCompleted.value) showResult.value = true;
}

// 清空当前选择，方便重新评估工作现状。
function resetScore() {
  selectedScores.value = resignationScoreList.map(() => null);
  showResult.value = false;
  activeItemIndex.value = 0;
}
</script>

<template>
  <SfScrollbar class="h-full bg-sf-page" flush>
    <main class="mx-auto w-full max-w-screen-xl px-3 py-3 text-sf-text">
      <nav aria-label="面包屑" class="text-sm text-sf-text-2">
        <RouterLink to="/resume/guide" class="transition-colors hover:text-sf-theme">
          求职指南
        </RouterLink>
        <span class="px-3" aria-hidden="true">/</span>
        <span aria-current="page">离职决策快速评分</span>
      </nav>

      <header v-if="!showResult" class="mt-3 rounded-3xl border border-sf-b bg-sf-primary p-3">
        <p class="text-sm font-semibold text-sf-theme">1 分钟完成自测</p>
        <h1 class="mt-3 text-3xl font-black">离职决策 10 项快速评分表</h1>
        <p class="mt-3 max-w-3xl leading-normal text-sf-text-2">
          每项满分 10 分，选择最贴合你现状的档位。完成全部十项后，系统会自动计算总分并给出对应结果。
        </p>
      </header>

      <section class="mt-3">
        <article v-if="!showResult" class="grid gap-3">
          <nav
            class="rounded-3xl border border-sf-b bg-sf-primary p-3"
            aria-label="评分项目进度"
          >
            <p class="text-sm font-semibold text-sf-text-2">
              第 {{ activeItemIndex + 1 }} / {{ resignationScoreList.length }} 项 · 已完成
              {{ completedCount }} 项
            </p>
            <ol class="mt-3 grid grid-cols-5 gap-3 md:grid-cols-10">
              <li v-for="(item, itemIndex) in resignationScoreList" :key="item.title">
                <button
                  type="button"
                  class="h-9 w-full cursor-pointer rounded-full border font-bold transition-colors hover:border-sf-theme hover:bg-sf-bg"
                  :class="[
                    activeItemIndex === itemIndex
                      ? 'border-sf-theme bg-sf-theme-3 text-sf-theme'
                      : 'border-sf-b bg-sf-primary text-sf-text-2',
                    selectedScores[itemIndex] !== null && activeItemIndex !== itemIndex
                      ? 'border-sf-theme text-sf-theme'
                      : '',
                  ]"
                  :aria-current="activeItemIndex === itemIndex ? 'step' : undefined"
                  :aria-label="`${itemIndex + 1}. ${item.title}${selectedScores[itemIndex] !== null ? '，已完成' : '，未完成'}`"
                  @click="switchScoreItem(itemIndex)"
                >
                  {{ itemIndex + 1 }}
                </button>
              </li>
            </ol>
          </nav>

          <fieldset
            :key="activeScoreItem.title"
            class="rounded-3xl border border-sf-b bg-sf-primary p-3"
          >
            <legend class="px-3 text-xl font-bold">
              {{ activeItemIndex + 1 }}. {{ activeScoreItem.title }}
            </legend>
            <ul class="mt-3 grid gap-3 md:grid-cols-2">
              <li v-for="option in activeScoreItem.options" :key="option.score">
                <button
                  type="button"
                  class="h-full w-full cursor-pointer rounded-3xl border p-3 text-left transition-colors hover:border-sf-theme hover:bg-sf-bg"
                  :class="
                    selectedScores[activeItemIndex] === option.score
                      ? 'border-sf-theme bg-sf-theme-3'
                      : 'border-sf-b bg-sf-primary'
                  "
                  :aria-pressed="selectedScores[activeItemIndex] === option.score"
                  @click="selectScore(activeItemIndex, option.score)"
                >
                  <span class="leading-normal text-sf-text-2">{{ option.description }}</span>
                </button>
              </li>
            </ul>
            <footer class="mt-3 flex items-center justify-between gap-3 border-t border-sf-b pt-3">
              <SfButton
                plain
                :disabled="activeItemIndex === 0"
                @click="switchScoreItem(activeItemIndex - 1)"
              >
                上一项
              </SfButton>
              <SfButton
                :disabled="activeItemIndex === resignationScoreList.length - 1"
                @click="switchScoreItem(activeItemIndex + 1)"
              >
                下一项
              </SfButton>
            </footer>
          </fieldset>
        </article>

        <section class="mt-3 rounded-3xl border border-sf-b bg-sf-primary p-3 text-center">
          <template v-if="!showResult">
            <h2 class="text-2xl font-black">查看评估结果</h2>
            <p class="mt-3 text-sf-text-2">
              {{
                isCompleted
                  ? "十项评分已完成，可以查看评估结果。"
                  : `已完成 ${completedCount} / ${resignationScoreList.length} 项，还需完成 ${resignationScoreList.length - completedCount} 项。`
              }}
            </p>
            <SfButton
              :disabled="!isCompleted"
              size="large"
              class="mx-auto mt-3"
              @click="viewScoreResult"
            >
              查看评估结果
            </SfButton>
          </template>

          <article
            v-if="showResult && scoreResult"
            class="relative mt-3 overflow-hidden rounded-3xl border-4 border-double border-sf-theme bg-sf-primary p-6 text-center"
            aria-live="polite"
          >
            <span
              class="pointer-events-none absolute left-3 top-3 h-12 w-12 border-l-4 border-t-4 border-sf-theme"
              aria-hidden="true"
            ></span>
            <span
              class="pointer-events-none absolute right-3 top-3 h-12 w-12 border-r-4 border-t-4 border-sf-theme"
              aria-hidden="true"
            ></span>
            <span
              class="pointer-events-none absolute bottom-3 left-3 h-12 w-12 border-b-4 border-l-4 border-sf-theme"
              aria-hidden="true"
            ></span>
            <span
              class="pointer-events-none absolute bottom-3 right-3 h-12 w-12 border-b-4 border-r-4 border-sf-theme"
              aria-hidden="true"
            ></span>

            <p class="text-sm font-semibold text-sf-theme">轻舟简历 · 求职指南</p>
            <h2 class="mt-3 text-3xl font-black">工作去留评估结果</h2>
            <p class="mt-6 text-sm text-sf-text-2">当前工作综合得分</p>
            <p class="mt-3 text-6xl font-black text-sf-theme">
              {{ totalScore }}<span class="text-lg text-sf-text-2"> / 100</span>
            </p>
            <p
              class="mx-auto mt-6 w-fit rounded-full border border-sf-theme bg-sf-theme-3 px-3 font-bold text-sf-theme"
            >
              {{ scoreResult.rangeLabel }}
            </p>
            <p class="mx-auto mt-3 max-w-2xl text-xl font-bold leading-normal text-sf-text">
              {{ scoreResult.content }}
            </p>
            <footer class="mt-6 border-t border-sf-b pt-3 text-sm text-sf-text-2">
              本成绩根据收入、福利、通勤、工作边界、发展与身心健康等十项现状综合计算。
            </footer>
          </article>

          <SfButton v-if="showResult" plain class="mx-auto mt-3" @click="resetScore">
            重新评分
          </SfButton>
        </section>
      </section>
    </main>
  </SfScrollbar>
</template>

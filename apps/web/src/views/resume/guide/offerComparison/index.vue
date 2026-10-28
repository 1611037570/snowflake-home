<script setup lang="ts">
import { computed, ref } from "vue";
import PublicContent from "../../seo/publicContent.vue";

import {
  offerComparisonMetrics,
  type OfferComparisonMetric,
  type OfferMetricKey,
} from "./data";

type OfferValueStatus = "empty" | "value" | "unknown";
type MetricComparisonLevel = "advantage" | "close" | "middle" | "weak" | "pending" | "insufficient";

/** 单份 Offer 在一个维度下的填写状态。 */
interface OfferMetricEntry {
  /** 当前维度尚未填写、有值或不清楚。 */
  status: OfferValueStatus;
  /** 当前维度用于比较的数值。 */
  value: number | null;
}

/** 一家公司参与对比的完整数据。 */
interface OfferCompany {
  /** 公司数据的稳定标识。 */
  id: string;
  /** 用户填写的公司或 Offer 名称。 */
  name: string;
  /** 名称为空时使用的默认名称。 */
  fallbackName: string;
  /** 全部对比维度的填写状态。 */
  metrics: Record<OfferMetricKey, OfferMetricEntry>;
}

/** 单个维度的多公司比较结果。 */
interface MetricComparisonDetail {
  /** 当前比较的维度配置。 */
  metric: OfferComparisonMetric;
  /** 当前维度具备可比较信息的公司标识。 */
  knownCompanyIds: string[];
  /** 当前维度处于优势的公司标识。 */
  advantageCompanyIds: string[];
  /** 当前维度相对偏弱的公司标识。 */
  weakCompanyIds: string[];
}

/** 单家公司的综合结果。 */
interface CompanyComparisonResult {
  /** 对应的公司数据。 */
  company: OfferCompany;
  /** 按可比较维度折算的百分制得分。 */
  score: number;
  /** 实际参与该公司评分的内部权重。 */
  comparableWeight: number;
}

let companySequence = 0;

// 创建单家公司使用的空白维度数据。
function createMetricEntries() {
  return Object.fromEntries(
    offerComparisonMetrics.map((metric) => [metric.key, { status: "empty", value: null }]),
  ) as Record<OfferMetricKey, OfferMetricEntry>;
}

// 创建可动态增加的公司，默认名称按添加顺序生成。
function createCompany(): OfferCompany {
  companySequence += 1;
  const alphabeticalName = companySequence <= 26
    ? String.fromCharCode(64 + companySequence)
    : String(companySequence);
  return {
    id: `offer-${companySequence}`,
    name: "",
    fallbackName: `Offer ${alphabeticalName}`,
    metrics: createMetricEntries(),
  };
}

const companies = ref<OfferCompany[]>([createCompany(), createCompany()]);
const activeMetricIndex = ref(0);
const showResult = ref(false);

const activeMetric = computed(() => offerComparisonMetrics[activeMetricIndex.value]!);
const completedCount = computed(
  () => offerComparisonMetrics.filter((metric) => isMetricCompleted(metric.key)).length,
);
const isCompleted = computed(() => completedCount.value === offerComparisonMetrics.length);

// 统一取得公司展示名称，空名称使用创建时的默认名称。
function getCompanyName(company: OfferCompany) {
  return company.name.trim() || company.fallbackName;
}

// 判断一个维度的所有公司是否都已填写或标记信息状态。
function isMetricCompleted(metricKey: OfferMetricKey) {
  return companies.value.every((company) => company.metrics[metricKey].status !== "empty");
}

// 查找指定公司，供各类输入操作更新当前维度。
function getCompany(companyId: string) {
  return companies.value.find((company) => company.id === companyId);
}

// 更新数值项，清空输入时恢复未填写状态。
function setMetricValue(companyId: string, value: number | undefined) {
  const company = getCompany(companyId);
  if (!company) return;
  company.metrics[activeMetric.value.key] = {
    status: typeof value === "number" ? "value" : "empty",
    value: typeof value === "number" ? value : null,
  };
}

// 更新主观选择项，并保留其他公司的当前选择。
function selectMetricChoice(companyId: string, value: number) {
  const company = getCompany(companyId);
  if (!company) return;
  company.metrics[activeMetric.value.key] = { status: "value", value };
}

// 标记当前维度暂不清楚，供计分与待确认清单区分处理。
function setMetricStatus(companyId: string, status: "unknown") {
  const company = getCompany(companyId);
  if (!company) return;
  company.metrics[activeMetric.value.key] = { status, value: null };
}

// 切换当前对比维度，已填写内容继续保留。
function switchMetric(metricIndex: number) {
  activeMetricIndex.value = metricIndex;
}

// 增加一家公司后，所有维度需补充该公司的对应信息。
function addCompany() {
  companies.value.push(createCompany());
}

// 至少保留两家公司，移除后其填写数据不再参与对比。
function removeCompany(companyId: string) {
  if (companies.value.length <= 2) return;
  companies.value = companies.value.filter((company) => company.id !== companyId);
}

// 只有已填写的具体值参与比较，不清楚与未填写不参与比较。
function isComparableEntry(entry: OfferMetricEntry) {
  return entry.status === "value";
}

// 取得用于内部比较的数值。
function getComparableValue(entry: OfferMetricEntry) {
  return entry.value ?? 0;
}

// 比较两家公司在单个维度的优劣，一代表前者更好，负一代表后者更好。
function compareEntries(
  metric: OfferComparisonMetric,
  firstEntry: OfferMetricEntry,
  secondEntry: OfferMetricEntry,
) {
  const first = getComparableValue(firstEntry);
  const second = getComparableValue(secondEntry);
  if (first === second) return 0;

  if (metric.inputType === "number") {
    const comparisonBase = Math.max(Math.abs(first), Math.abs(second), 1);
    if (Math.abs(first - second) / comparisonBase <= 0.05) return 0;
  }

  const firstWins = metric.direction === "higher" ? first > second : first < second;
  return firstWins ? 1 : -1;
}

// 找出一个维度中最好或最弱的公司，接近的公司会同时保留。
function findBoundaryCompanies(
  metric: OfferComparisonMetric,
  knownCompanies: OfferCompany[],
  boundary: "best" | "weak",
) {
  if (!knownCompanies.length) return [];
  let boundaryCompanies = [knownCompanies[0]!];
  for (const company of knownCompanies.slice(1)) {
    const comparison = compareEntries(
      metric,
      company.metrics[metric.key],
      boundaryCompanies[0]!.metrics[metric.key],
    );
    const boundaryComparison = boundary === "best" ? comparison : -comparison;
    if (boundaryComparison > 0) boundaryCompanies = [company];
    else if (boundaryComparison === 0) boundaryCompanies.push(company);
  }
  return boundaryCompanies.map((company) => company.id);
}

const metricDetails = computed<MetricComparisonDetail[]>(() =>
  offerComparisonMetrics.map((metric) => {
    const knownCompanies = companies.value.filter((company) =>
      isComparableEntry(company.metrics[metric.key]),
    );
    const advantageCompanyIds = findBoundaryCompanies(metric, knownCompanies, "best");
    const weakCompanyIds = findBoundaryCompanies(metric, knownCompanies, "weak");
    const allClose = knownCompanies.length > 1 && advantageCompanyIds.length === knownCompanies.length;
    return {
      metric,
      knownCompanyIds: knownCompanies.map((company) => company.id),
      advantageCompanyIds: allClose ? [] : advantageCompanyIds,
      weakCompanyIds: allClose ? [] : weakCompanyIds,
    };
  }),
);

// 将单项填写值换算为零到一的得分比例。
function calculateMetricScoreRatio(metric: OfferComparisonMetric, value: number) {
  if (metric.inputType === "choice") {
    const maximumValue = Math.max(...(metric.options ?? []).map((option) => option.value), 1);
    return Math.min(Math.max(value / maximumValue, 0), 1);
  }

  const fullScoreThreshold = metric.fullScoreThreshold ?? 0;
  if (metric.direction === "higher") {
    if (fullScoreThreshold <= 0) return 0;
    return Math.min(Math.max(value / fullScoreThreshold, 0), 1);
  }

  if (value <= fullScoreThreshold) return 1;
  const maximumValue = metric.max ?? fullScoreThreshold;
  if (maximumValue <= fullScoreThreshold) return 0;
  return Math.min(Math.max((maximumValue - value) / (maximumValue - fullScoreThreshold), 0), 1);
}

// 按各项权重计算单家公司成绩，未知信息不参与并按已知权重折算。
function calculateCompanyResult(company: OfferCompany): CompanyComparisonResult {
  let weightedScore = 0;
  let comparableWeight = 0;

  for (const metric of offerComparisonMetrics) {
    const entry = company.metrics[metric.key];
    if (!isComparableEntry(entry)) continue;
    comparableWeight += metric.weight;
    weightedScore += metric.weight * calculateMetricScoreRatio(metric, entry.value ?? 0);
  }

  return {
    company,
    score: comparableWeight ? weightedScore / comparableWeight * 100 : 0,
    comparableWeight,
  };
}

const rankedCompanies = computed(() =>
  companies.value
    .map((company) => calculateCompanyResult(company))
    .sort((first, second) => second.score - first.score),
);
const resultTitle = computed(() => {
  const comparableResults = rankedCompanies.value.filter((result) => result.comparableWeight > 0);
  if (!comparableResults.length) return "可比较信息不足，暂时无法判断";
  if (comparableResults.length === 1) return "只有一家公司具备可比较信息";
  if (comparableResults[0]!.score - comparableResults[1]!.score < 5) {
    return "排名靠前的 Offer 综合表现接近";
  }
  return `${getCompanyName(comparableResults[0]!.company)} 的综合表现领先`;
});

// 判断一家公司在指定维度中的对比状态。
function getMetricLevel(detail: MetricComparisonDetail, company: OfferCompany): MetricComparisonLevel {
  const entry = company.metrics[detail.metric.key];
  if (entry.status === "unknown") return "pending";
  if (!isComparableEntry(entry)) return "insufficient";
  if (detail.knownCompanyIds.length < 2) return "insufficient";
  if (!detail.advantageCompanyIds.length && !detail.weakCompanyIds.length) return "close";
  if (detail.advantageCompanyIds.includes(company.id)) return "advantage";
  if (detail.weakCompanyIds.includes(company.id)) return "weak";
  return "middle";
}

// 将内部对比状态转换为结果页可读文案。
function getMetricLevelLabel(detail: MetricComparisonDetail, company: OfferCompany) {
  const labelMap: Record<MetricComparisonLevel, string> = {
    advantage: "占优",
    close: "接近",
    middle: "居中",
    weak: "偏弱",
    pending: "待确认",
    insufficient: "信息不足",
  };
  return labelMap[getMetricLevel(detail, company)];
}

// 格式化结果表中的数值与未知状态。
function formatMetricValue(metric: OfferComparisonMetric, company: OfferCompany) {
  const entry = company.metrics[metric.key];
  if (entry.status === "unknown") return "未说明 / 不清楚";
  if (entry.status !== "value" || entry.value === null) return "未填写";
  if (metric.inputType === "choice") {
    return metric.options?.find((choice) => choice.value === entry.value)?.label ?? "未填写";
  }
  return `${entry.value}${metric.unit ?? ""}`;
}

// 汇总单家公司的优势项。
function getCompanyAdvantages(company: OfferCompany) {
  return metricDetails.value
    .filter((detail) => getMetricLevel(detail, company) === "advantage")
    .map((detail) => detail.metric.title);
}

// 汇总单家公司的相对短板。
function getCompanyWeaknesses(company: OfferCompany) {
  return metricDetails.value
    .filter((detail) => getMetricLevel(detail, company) === "weak")
    .map((detail) => detail.metric.title);
}

// 汇总单家公司在签约前仍需确认的项目。
function getCompanyPendingMetrics(company: OfferCompany) {
  return offerComparisonMetrics
    .filter((metric) => company.metrics[metric.key].status === "unknown")
    .map((metric) => metric.title);
}

// 全部维度完成后由用户主动查看对比结果。
function viewComparisonResult() {
  if (isCompleted.value) showResult.value = true;
}

// 清空所有公司与维度数据，重新从两家公司开始对比。
function resetComparison() {
  companySequence = 0;
  companies.value = [createCompany(), createCompany()];
  activeMetricIndex.value = 0;
  showResult.value = false;
}

// 对比得分保留一位小数，并去掉整数末尾的小数点。
function formatScore(score: number) {
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}
</script>

<template>
  <SfScrollbar class="h-full bg-sf-page" flush>
    <main class="mx-auto w-full max-w-screen-xl px-3 py-3 text-sf-text">
      <nav aria-label="面包屑" class="text-sm text-sf-text-2">
        <RouterLink to="/resume/tools" class="transition-colors hover:text-sf-theme">
          求职工具
        </RouterLink>
        <span class="px-3" aria-hidden="true">/</span>
        <span aria-current="page">Offer 对比决策器</span>
      </nav>

      <header v-if="!showResult" class="mt-3 rounded-3xl border border-sf-b bg-sf-primary p-3">
        <h1 class="text-xl font-bold">Offer 对比决策器</h1>
        <p class="mt-3 max-w-3xl text-sm leading-normal text-sf-text-2">
          逐项填写多份 Offer 的收入、福利、时间成本、稳定性与成长条件，完成后查看综合排序和逐项优劣。
        </p>
      </header>

      <section v-if="!showResult" class="mt-3 grid gap-3">
        <section class="rounded-3xl border border-sf-b bg-sf-primary p-3">
          <header class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-base font-bold">参与对比的公司</h2>
            <SfButton plain @click="addCompany">增加公司</SfButton>
          </header>
          <ul class="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <li
              v-for="company in companies"
              :key="company.id"
              class="rounded-3xl border border-sf-b bg-sf-bg p-3"
            >
              <header class="flex items-center justify-between gap-3">
                <span class="font-semibold">{{ company.fallbackName }}</span>
                <SfButton
                  v-if="companies.length > 2"
                  type="error"
                  plain
                  size="small"
                  @click="removeCompany(company.id)"
                >
                  移除
                </SfButton>
              </header>
              <label class="mt-3 block text-sm font-semibold">
                公司或 Offer 名称
                <SfInput
                  v-model="company.name"
                  :placeholder="`例如：${company.fallbackName} 公司名称`"
                  class="mt-3 h-9 w-full border border-sf-b bg-sf-primary text-sm"
                />
              </label>
            </li>
          </ul>
        </section>

        <nav
          class="rounded-3xl border border-sf-b bg-sf-primary p-3"
          aria-label="Offer 对比项目进度"
        >
          <p class="text-sm font-semibold text-sf-text-2">
            第 {{ activeMetricIndex + 1 }} / {{ offerComparisonMetrics.length }} 项 · 已完成
            {{ completedCount }} 项
          </p>
          <ol class="mt-3 grid grid-cols-5 gap-3 md:grid-cols-10">
            <li v-for="(metric, metricIndex) in offerComparisonMetrics" :key="metric.key">
              <button
                type="button"
                class="h-9 w-full cursor-pointer rounded-full border font-normal transition-colors hover:border-sf-theme hover:bg-sf-bg"
                :class="[
                  activeMetricIndex === metricIndex
                    ? 'border-sf-theme bg-sf-theme-3 text-sf-theme'
                    : 'border-sf-b bg-sf-primary text-sf-text-2',
                  isMetricCompleted(metric.key) && activeMetricIndex !== metricIndex
                    ? 'border-sf-theme text-sf-theme'
                    : '',
                ]"
                :aria-current="activeMetricIndex === metricIndex ? 'step' : undefined"
                :aria-label="`${metricIndex + 1}. ${metric.title}${isMetricCompleted(metric.key) ? '，已完成' : '，未完成'}`"
                @click="switchMetric(metricIndex)"
              >
                {{ metricIndex + 1 }}
              </button>
            </li>
          </ol>
        </nav>

        <fieldset
          :key="activeMetric.key"
          class="rounded-3xl border border-sf-b bg-sf-primary p-3"
        >
          <legend class="px-3 text-base font-bold">
            {{ activeMetricIndex + 1 }}. {{ activeMetric.title }}
          </legend>
          <p class="mt-3 text-sm leading-normal text-sf-text-2">{{ activeMetric.description }}</p>

          <section
            v-if="activeMetric.inputType === 'number'"
            class="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3"
          >
            <article
              v-for="company in companies"
              :key="company.id"
              class="rounded-3xl border border-sf-b bg-sf-bg p-3"
            >
              <h2 class="text-sm font-bold">{{ getCompanyName(company) }}</h2>
              <SfInputNumber
                :model-value="company.metrics[activeMetric.key].value"
                :min="activeMetric.min ?? 0"
                :max="activeMetric.max"
                :step="activeMetric.step ?? 1"
                :precision="(activeMetric.step ?? 1) < 1 ? 1 : 0"
                class="mt-3 h-9 w-full border border-sf-b bg-sf-primary text-sm"
                @update:model-value="setMetricValue(company.id, $event)"
              />
              <p class="mt-3 text-sm text-sf-text-2">单位：{{ activeMetric.unit }}</p>
              <footer class="mt-3 flex flex-wrap gap-3 border-t border-sf-b pt-3">
                <button
                  type="button"
                  class="h-9 cursor-pointer rounded-3xl border px-3 text-sm transition-colors hover:border-sf-theme hover:bg-sf-primary"
                  :class="
                    company.metrics[activeMetric.key].status === 'unknown'
                      ? 'border-sf-theme bg-sf-theme-3 text-sf-theme'
                      : 'border-sf-b bg-sf-primary text-sf-text-2'
                  "
                  :aria-pressed="company.metrics[activeMetric.key].status === 'unknown'"
                  @click="setMetricStatus(company.id, 'unknown')"
                >
                  未说明 / 不清楚
                </button>
              </footer>
            </article>
          </section>

          <ul v-else class="mt-3 grid gap-3">
            <li
              v-for="choice in activeMetric.options"
              :key="choice.value"
              class="rounded-3xl border border-sf-b bg-sf-bg p-3"
            >
              <p class="text-sm font-normal leading-normal">{{ choice.label }}</p>
              <ul class="mt-3 flex flex-wrap gap-3">
                <li v-for="company in companies" :key="company.id">
                  <button
                    type="button"
                    class="h-9 cursor-pointer rounded-3xl border px-3 text-sm font-normal transition-colors hover:border-sf-theme hover:bg-sf-primary"
                    :class="
                      company.metrics[activeMetric.key].status === 'value' &&
                      company.metrics[activeMetric.key].value === choice.value
                        ? 'border-sf-theme bg-sf-theme-3 text-sf-theme'
                        : 'border-sf-b bg-sf-primary text-sf-text-2'
                    "
                    :aria-pressed="
                      company.metrics[activeMetric.key].status === 'value' &&
                      company.metrics[activeMetric.key].value === choice.value
                    "
                    :aria-label="`${getCompanyName(company)}：${choice.label}`"
                    @click="selectMetricChoice(company.id, choice.value)"
                  >
                    {{ getCompanyName(company) }}
                  </button>
                </li>
              </ul>
            </li>
            <li class="rounded-3xl border border-sf-b bg-sf-bg p-3">
              <p class="text-sm font-normal">未说明 / 不清楚</p>
              <ul class="mt-3 flex flex-wrap gap-3">
                <li v-for="company in companies" :key="company.id">
                  <button
                    type="button"
                    class="h-9 cursor-pointer rounded-3xl border px-3 text-sm font-normal transition-colors hover:border-sf-theme hover:bg-sf-primary"
                    :class="
                      company.metrics[activeMetric.key].status === 'unknown'
                        ? 'border-sf-theme bg-sf-theme-3 text-sf-theme'
                        : 'border-sf-b bg-sf-primary text-sf-text-2'
                    "
                    :aria-pressed="company.metrics[activeMetric.key].status === 'unknown'"
                    :aria-label="`${getCompanyName(company)}：未说明或不清楚`"
                    @click="setMetricStatus(company.id, 'unknown')"
                  >
                    {{ getCompanyName(company) }}
                  </button>
                </li>
              </ul>
            </li>
          </ul>

          <footer class="mt-3 flex items-center justify-between gap-3 border-t border-sf-b pt-3">
            <SfButton
              plain
              :disabled="activeMetricIndex === 0"
              @click="switchMetric(activeMetricIndex - 1)"
            >
              上一项
            </SfButton>
            <SfButton
              :disabled="activeMetricIndex === offerComparisonMetrics.length - 1"
              @click="switchMetric(activeMetricIndex + 1)"
            >
              下一项
            </SfButton>
          </footer>
        </fieldset>

        <section class="rounded-3xl border border-sf-b bg-sf-primary p-3 text-center">
          <h2 class="text-lg font-bold">查看对比结果</h2>
          <p class="mt-3 text-sm text-sf-text-2">
            {{
              isCompleted
                ? "全部对比项已完成，可以查看结果。"
                : `已完成 ${completedCount} / ${offerComparisonMetrics.length} 项，还需完成 ${offerComparisonMetrics.length - completedCount} 项。`
            }}
          </p>
          <SfButton
            :disabled="!isCompleted"
            class="mx-auto mt-3"
            @click="viewComparisonResult"
          >
            查看对比结果
          </SfButton>
        </section>
      </section>

      <section v-else class="mt-3 rounded-3xl border border-sf-b bg-sf-primary p-3 text-center">
        <article
          class="relative overflow-hidden rounded-3xl border-4 border-double border-sf-theme bg-sf-primary p-3 text-center"
          aria-live="polite"
        >
          <span
            class="pointer-events-none absolute left-3 top-3 h-9 w-9 border-l-4 border-t-4 border-sf-theme"
            aria-hidden="true"
          ></span>
          <span
            class="pointer-events-none absolute right-3 top-3 h-9 w-9 border-r-4 border-t-4 border-sf-theme"
            aria-hidden="true"
          ></span>
          <span
            class="pointer-events-none absolute bottom-3 left-3 h-9 w-9 border-b-4 border-l-4 border-sf-theme"
            aria-hidden="true"
          ></span>
          <span
            class="pointer-events-none absolute bottom-3 right-3 h-9 w-9 border-b-4 border-r-4 border-sf-theme"
            aria-hidden="true"
          ></span>

          <p class="text-xs font-semibold text-sf-theme">轻舟简历 · 求职工具</p>
          <h1 class="mt-3 text-xl font-bold">Offer 综合对比结果</h1>
          <p class="mt-3 text-base font-bold text-sf-text">{{ resultTitle }}</p>

          <ol class="mx-auto mt-3 grid max-w-5xl gap-3 md:grid-cols-2 xl:grid-cols-3">
            <li
              v-for="(result, resultIndex) in rankedCompanies"
              :key="result.company.id"
              class="rounded-3xl border border-sf-b bg-sf-bg p-3 text-left"
            >
              <p class="text-sm font-semibold text-sf-text-2">综合排序第 {{ resultIndex + 1 }} 名</p>
              <h2 class="mt-3 text-base font-bold">{{ getCompanyName(result.company) }}</h2>
              <p class="mt-3 text-3xl font-black text-sf-theme">
                {{ result.comparableWeight ? formatScore(result.score) : "—" }}
              </p>
              <p class="mt-3 text-sm text-sf-text-2">基于已知项目折算的综合得分</p>
              <p class="mt-3 text-sm font-semibold">优势项</p>
              <p class="mt-3 text-sm leading-normal text-sf-text-2">
                {{ getCompanyAdvantages(result.company).join("、") || "暂无明显优势项" }}
              </p>
              <p class="mt-3 text-sm font-semibold">相对短板</p>
              <p class="mt-3 text-sm leading-normal text-sf-text-2">
                {{ getCompanyWeaknesses(result.company).join("、") || "暂无明显短板" }}
              </p>
              <p class="mt-3 text-sm font-semibold">签约前待确认</p>
              <p class="mt-3 text-sm leading-normal text-sf-text-2">
                {{ getCompanyPendingMetrics(result.company).join("、") || "无" }}
              </p>
            </li>
          </ol>

          <section class="mt-3 text-left">
            <h2 class="text-lg font-bold text-center">逐项优劣对比</h2>
            <div class="mt-3 overflow-x-auto rounded-3xl border border-sf-b">
              <table class="w-full min-w-max border-collapse bg-sf-primary text-sm">
                <thead>
                  <tr class="border-b border-sf-b bg-sf-bg text-left">
                    <th class="p-3">对比项目</th>
                    <th v-for="company in companies" :key="company.id" class="p-3">
                      {{ getCompanyName(company) }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="detail in metricDetails"
                    :key="detail.metric.key"
                    class="border-b border-sf-b last:border-b-0"
                  >
                    <th class="p-3 text-left">{{ detail.metric.title }}</th>
                    <td v-for="company in companies" :key="company.id" class="p-3">
                      <p class="text-sf-text">{{ formatMetricValue(detail.metric, company) }}</p>
                      <p class="mt-3 font-semibold text-sf-text-2">
                        {{ getMetricLevelLabel(detail, company) }}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <footer class="mt-3 border-t border-sf-b pt-3 text-xs text-sf-text-2">
            不清楚的维度不参与该公司的计分，结果按实际已知信息分别折算；请结合个人优先级、风险承受能力和长期目标作出最终选择。
          </footer>
        </article>

        <SfButton plain class="mx-auto mt-3" @click="resetComparison">重新对比</SfButton>
      </section>
      <!-- 对比维度说明复用工具数据，和静态网页保持一致。 -->
      <PublicContent />
    </main>
  </SfScrollbar>
</template>

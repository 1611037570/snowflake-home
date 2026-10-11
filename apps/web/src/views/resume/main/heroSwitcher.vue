<template>
  <div v-if="items.length" class="relative">
    <!-- 叠放区：上一份、当前、下一份常驻卡片，翻页时前后卡同时位移形成联动 -->
    <div
      class="hero-switcher__stack relative px-6 sm:px-0"
      :class="{ 'is-animating': animating, 'is-tilted': tilted }"
    >
      <div class="relative aspect-[794/1123]">
        <div
          v-for="layer in layers"
          :key="layer.fileName"
          class="hero-switcher__card absolute inset-0 overflow-hidden border border-sf-b bg-sf-bg"
          :class="[cardClass(layer), { 'is-entering': enteringKeys.includes(layer.fileName) }]"
        >
          <ThumbPreview v-if="previewOf(layer.fileName)" :item="previewOf(layer.fileName)" />
          <div v-else class="flex-c absolute inset-0">
            <SfIcon
              icon="line-md:loading-twotone-loop"
              size="6"
              class="animate-spin text-sf-theme"
            />
          </div>
        </div>
        <!-- 鼠标经过简历时浮出的操作入口，由父级通过插槽提供 -->
        <slot></slot>
      </div>
    </div>
    <!-- 切换控制：左右箭头翻页，圆点直达对应简历 -->
    <div class="relative mt-6 flex items-center justify-center gap-3">
      <button
        type="button"
        class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-sf-b bg-sf-primary text-sf-text-3 transition-colors duration-300 hover:border-sf-theme hover:text-sf-theme"
        :aria-label="$t('resumeHomeHeroPrev')"
        @click="turn(-1)"
      >
        <SfIcon icon="mdi:chevron-left" size="5" />
      </button>
      <div class="flex items-center gap-3">
        <button
          v-for="(item, index) in items"
          :key="item.fileName"
          type="button"
          class="relative h-2 w-2 cursor-pointer rounded-full transition-colors duration-300 before:absolute before:-inset-2 before:content-['']"
          :class="index === activeIndex ? 'bg-sf-theme' : 'bg-sf-bg-3 hover:bg-sf-text-3'"
          :aria-label="item.name"
          :title="item.name"
          :aria-current="index === activeIndex"
          @click="goTo(index)"
        ></button>
      </div>
      <button
        type="button"
        class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-sf-b bg-sf-primary text-sf-text-3 transition-colors duration-300 hover:border-sf-theme hover:text-sf-theme"
        :aria-label="$t('resumeHomeHeroNext')"
        @click="turn(1)"
      >
        <SfIcon icon="mdi:chevron-right" size="5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, markRaw, onMounted, ref, watch } from "vue";
import { loadResumeTemplateData } from "@/views/resume/template/data/resumeData";

defineOptions({ name: "HeroSwitcher" });

// 当前简历变化时通知父级：data 为当前范本数据，供父级按当前范本创建简历
const emit = defineEmits(["change"]);

// 简历预览异步加载，避免把简历渲染引擎并入首页入口包
const ThumbPreview = defineAsyncComponent(
  () => import("@/views/resume/editor/preview/modes/thumb.vue"),
);

const props = defineProps({
  // 可切换的范本条目：fileName 为范本标识，name 为范本展示名称
  items: {
    type: Array,
    required: true,
  },
});

// 翻页动画时长，与样式中的过渡时长保持一致
const TURN_DURATION = 560;

// 当前展示的范本下标
const activeIndex = ref(0);

// 翻页目标下标：圆点直达的目标可能不相邻，动画期间由它决定入场卡片
const pendingIndex = ref(null);

// 翻页方向：1 表示向后、-1 表示向前
const pendingStep = ref(1);

// 动画阶段：idle 静止、*-setup 入场卡定位、next 向后翻、prev 向前翻
const phase = ref("idle");

// 动画进行中：仅在此期间启用卡片过渡，归位重排时瞬移避免回弹
const animating = ref(false);

// 翻页进行中标记，用于记录动画期间的点击
const turning = ref(false);

// 动画期间被点下的下一次翻页：本轮结束后立即执行，避免点击无响应
const queued = ref(null);

// 新补入叠放位的卡片：先落在入场位置，再过渡到叠放位
const enteringKeys = ref([]);

// 范本数据缓存：按文件名保存，未命中才发起加载
const previewCache = ref({});

// 叠放卡入场倾斜：挂载后下一帧再启用，保证从水平过渡到倾斜角度
const tilted = ref(false);

// 翻页轮次：新一轮开始时让上一轮的收尾动画失效
let turnToken = 0;

// 当前范本标识
const activeFileName = computed(() => props.items[activeIndex.value]?.fileName ?? "");

// 叠放区各层位对应的范本下标：动画期间按翻页目标取入场卡
const layerIndexes = computed(() => {
  const size = props.items.length;
  if (!size) return null;
  const jumping = pendingIndex.value !== null;
  const step = pendingStep.value;
  const incoming = jumping ? pendingIndex.value : (activeIndex.value + step + size) % size;
  const other = (activeIndex.value + (step > 0 ? -1 : 1) + size) % size;
  return {
    incoming,
    other,
    incomingRole: step > 0 ? "next" : "prev",
    otherRole: step > 0 ? "prev" : "next",
    // 向后翻页时提前挂载的新叠放卡：与翻页同时滑入，翻完即就位
    future: jumping && step > 0 ? (incoming + 1) % size : null,
    // 向后跳转时被跳过的相邻卡片先留在原位淡出，避免直接消失
    stale: jumping && step > 0 ? (activeIndex.value + step + size) % size : null,
  };
});

// 叠放区卡片：incoming 为入场卡、other 为另一侧、current 为当前展示
const layers = computed(() => {
  const indexes = layerIndexes.value;
  if (!indexes) return [];
  const list = [
    { role: indexes.otherRole, fileName: props.items[indexes.other].fileName },
    { role: indexes.incomingRole, fileName: props.items[indexes.incoming].fileName },
    { role: "current", fileName: activeFileName.value },
  ];
  if (indexes.stale !== null) {
    const staleFile = props.items[indexes.stale].fileName;
    // 被跳过的相邻卡片与入场卡重合时无需重复渲染
    if (!list.some((layer) => layer.fileName === staleFile)) {
      list.push({ role: "stale", fileName: staleFile });
    }
  }
  if (indexes.future !== null) {
    const futureFile = props.items[indexes.future].fileName;
    // 新叠放卡与已有卡片重合时无需重复渲染
    if (!list.some((layer) => layer.fileName === futureFile)) {
      list.push({ role: "future", fileName: futureFile });
    }
  }
  return list;
});

// 各动画阶段每张卡片的目标层位：前后卡同时位移，形成联动翻页
const PHASE_CLASS = {
  idle: { prev: "p-front-under", current: "p-front", next: "p-back", stale: "p-back", future: "p-back" },
  "next-setup": {
    prev: "p-front-under",
    current: "p-front",
    next: "p-enter-right",
    stale: "p-back",
    future: "p-back",
  },
  next: {
    prev: "p-front-under",
    current: "p-out-left",
    next: "p-front",
    stale: "p-fade-out",
    future: "p-back",
  },
  "prev-setup": { prev: "p-enter-left", current: "p-front", next: "p-back" },
  prev: { prev: "p-front", current: "p-back", next: "p-out-right" },
};

// 当前阶段下卡片的层位类名
const cardClass = (layer) => PHASE_CLASS[phase.value][layer.role];

// 按文件名取范本数据：未加载时为空，卡片显示加载态
const previewOf = (fileName) => previewCache.value[fileName] ?? null;

// 等待浏览器完成一次绘制，用于分离瞬移定位与过渡动画
const nextFrame = () =>
  new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

// 按文件名加载范本数据并写入缓存：加载失败记录为空值，避免反复请求
async function loadPreview(fileName) {
  if (!fileName || fileName in previewCache.value) return;
  try {
    previewCache.value[fileName] = markRaw(await loadResumeTemplateData(fileName));
  } catch {
    previewCache.value[fileName] = null;
  }
}

// 首选空闲时执行，浏览器不支持 requestIdleCallback 时退回定时器
function idle(callback) {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(callback, { timeout: 600 });
    return;
  }
  window.setTimeout(callback, 200);
}

// 依次在空闲时段预加载其余范本，保证点击切换立即生效
function prefetchPreviews() {
  let cursor = 0;
  const run = async () => {
    const item = props.items[cursor];
    cursor += 1;
    if (!item) return;
    await loadPreview(item.fileName);
    idle(run);
  };
  run();
}

// 翻页：stepSize 为 1 表示向后、-1 表示向前；target 为直达的范本下标，省略时取相邻一份
async function turn(stepSize, target) {
  const size = props.items.length;
  if (size < 2) return;
  // 动画期间的点击先记下来，本轮结束后立即执行，避免点击被吞掉
  if (turning.value) {
    queued.value = { stepSize, target };
    return;
  }
  // 圆点直达只给目标下标，方向按与当前下标较短的一侧决定
  let step = stepSize;
  if (target !== undefined) {
    if (target === activeIndex.value) return;
    const forward = (target - activeIndex.value + size) % size;
    const backward = (activeIndex.value - target + size) % size;
    step = forward <= backward ? 1 : -1;
  }
  const targetIndex = target ?? (activeIndex.value + step + size) % size;
  if (targetIndex === activeIndex.value) return;
  const targetFile = props.items[targetIndex].fileName;
  // 目标数据未就绪时先加载，加载失败保持当前简历
  if (!previewCache.value[targetFile]) {
    turning.value = true;
    await loadPreview(targetFile);
    turning.value = false;
    if (!previewCache.value[targetFile]) return;
  }
  turning.value = true;
  const token = (turnToken += 1);
  enteringKeys.value = [];
  const incomingRole = step > 0 ? "next" : "prev";
  // 直达跳转的入场卡不在叠放位上，先把它瞬移到入场位置再开始位移
  const incomingReady = layers.value.some(
    (layer) => layer.role === incomingRole && layer.fileName === targetFile,
  );
  // 向后翻页时新叠放卡与翻页同时滑入，翻页结束后无需再等一段收尾动画
  enteringKeys.value = step > 0 ? [props.items[(targetIndex + 1) % size].fileName] : [];
  pendingStep.value = step;
  pendingIndex.value = targetIndex;
  if (!incomingReady) {
    animating.value = false;
    phase.value = step > 0 ? "next-setup" : "prev-setup";
    await nextFrame();
    if (token !== turnToken) return;
  }
  animating.value = true;
  phase.value = step > 0 ? "next" : "prev";
  await new Promise((resolve) => window.setTimeout(resolve, TURN_DURATION));
  if (token !== turnToken) return;
  // 归位重排：关闭过渡后提交下标，层位与动画结束位置一致，不会出现回弹
  animating.value = false;
  activeIndex.value = targetIndex;
  pendingIndex.value = null;
  phase.value = "idle";
  turning.value = false;
  // 动画期间被点下的下一次翻页在这里立即执行，避免点击看起来没反应
  const pendingTurn = queued.value;
  queued.value = null;
  if (pendingTurn) turn(pendingTurn.stepSize, pendingTurn.target);
}

// 圆点直达：只记目标下标，翻页方向由 turn 按当前下标决定
function goTo(index) {
  turn(0, index);
}

// 当前简历或数据变化时同步给父级：fileName 为范本标识，data 为范本数据
watch(
  [activeFileName, () => previewOf(activeFileName.value)],
  ([fileName, data]) => emit("change", { fileName, data }),
  { immediate: true },
);

onMounted(async () => {
  // 双 rAF 确保首帧先按水平渲染，再触发倾斜过渡
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      tilted.value = true;
    });
  });
  // 先加载当前、下一份与上一份，其余范本空闲时补齐
  await loadPreview(activeFileName.value);
  await loadPreview(layers.value.find((layer) => layer.role === "next")?.fileName);
  await loadPreview(layers.value.find((layer) => layer.role === "prev")?.fileName);
  prefetchPreviews();
});
</script>

<style scoped>
.hero-switcher__stack {
  /* 叠放卡偏移量：窄屏用更小的偏移，避免倾斜卡片超出屏幕 */
  --hero-stack-shift-x: -24px;
  --hero-stack-shift-y: -12px;
}

@media (min-width: 640px) {
  .hero-switcher__stack {
    --hero-stack-shift-x: -88px;
    --hero-stack-shift-y: -24px;
  }
}

/* 主位（前卡） */
.p-front {
  transform: translate(0, 0) rotate(0deg) scale(1);
  opacity: 1;
  z-index: 2;
}

/* 被前卡完全遮住的位置：用于上一份卡片的待命 */
.p-front-under {
  transform: translate(0, 0) rotate(0deg) scale(1);
  opacity: 0;
  z-index: 0;
}

/* 后卡：左上倾斜叠放，露出下一份简历 */
.p-back {
  transform: translate(var(--hero-stack-shift-x), var(--hero-stack-shift-y)) rotate(-10deg) scale(0.85);
  opacity: 1;
  z-index: 1;
}

/* 首屏入场：后卡从水平位置过渡到倾斜位置 */
.hero-switcher__stack:not(.is-tilted) .p-back {
  transform: translate(0, 0) rotate(0deg) scale(1);
}

/* 前卡向后翻的离场位，与向前翻的入场位 */
.p-out-left,
.p-enter-left {
  transform: translate(-58%, -3%) rotate(-5deg) scale(0.9);
  opacity: 0;
  z-index: 3;
}

/* 前卡向前翻时后卡的退场位 */
.p-out-right {
  transform: translate(18%, -3%) rotate(4deg) scale(0.9);
  opacity: 0;
  z-index: 0;
}

/* 直达跳转的入场位：新卡片从右侧滑入主位 */
.p-enter-right {
  transform: translate(26%, -3%) rotate(4deg) scale(0.9);
  opacity: 0;
  z-index: 1;
}

/* 新补入叠放位的卡片：挂载即播放滑入动画，紧接翻页动画落下 */
.hero-switcher__card.is-entering {
  animation: hero-stack-enter 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes hero-stack-enter {
  from {
    transform: translate(26%, -3%) rotate(4deg) scale(0.9);
    opacity: 0;
  }
}

/* 被跳过的相邻卡片在原位淡出 */
.p-fade-out {
  transform: translate(var(--hero-stack-shift-x), var(--hero-stack-shift-y)) rotate(-10deg) scale(0.85);
  opacity: 0;
  z-index: 0;
}

/* 首屏入场：后卡从水平位置过渡到倾斜位置 */
.hero-switcher__stack:not(.is-animating) .p-back {
  transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 仅翻页期间启用过渡：前后卡在同一时长内联动位移 */
.hero-switcher__stack.is-animating .hero-switcher__card {
  transition:
    transform 0.56s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.4s ease-out;
}
</style>

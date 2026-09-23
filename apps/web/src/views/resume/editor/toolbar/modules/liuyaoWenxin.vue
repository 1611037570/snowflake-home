<script setup>
import { computed, onUnmounted, ref } from "vue";
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";

const resumeStore = useResumeStore();
const { system } = storeToRefs(resumeStore);

// 六爻问心弹窗可见性
const visible = ref(false);

// 正念呼吸：吸气 3 秒、吐气 3 秒
const PHASE_MS = 3000;
// 一轮呼吸总时长
const CYCLE_MS = PHASE_MS * 2;
// 是否处于呼吸引导中
const breathing = ref(false);
// 当前呼吸阶段：吸气 / 吐气，空串表示未开始
const phase = ref("");
// 剩余秒数
const remain = ref(0);
// 呼吸引导的定时器
let timer = null;
// 按钮文案：引导中展示倒计时
const buttonText = computed(() => (breathing.value ? `呼吸中 ${remain.value}s` : "开始正念"));

// 结束呼吸引导并复位
const stopBreathing = () => {
  if (timer) clearInterval(timer);
  timer = null;
  breathing.value = false;
  phase.value = "";
  remain.value = 0;
};

// 开始呼吸引导：按已过时长切换阶段，倒计时按当前阶段剩余时长计算
const startBreathing = () => {
  if (breathing.value) return;
  breathing.value = true;
  phase.value = "吸气";
  remain.value = PHASE_MS / 1000;
  const startAt = Date.now();
  timer = setInterval(() => {
    const elapsed = Date.now() - startAt;
    if (elapsed >= CYCLE_MS) {
      stopBreathing();
      return;
    }
    phase.value = elapsed < PHASE_MS ? "吸气" : "吐气";
    remain.value = Math.ceil((PHASE_MS - (elapsed % PHASE_MS)) / 1000);
  }, 100);
};

onUnmounted(stopBreathing);
</script>

<template>
  <!-- 调试模式下的六爻问心入口：展示易经第64卦未济，位于 QA 下方 -->
  <div v-if="system.showDebug" class="absolute -bottom-24 left-1/2 -translate-x-1/2">
    <SfTooltip content="六爻问心" placement="left">
      <div
        class="relative flex h-10 w-10 cursor-pointer flex-col items-center justify-evenly text-sf-theme-text"
        @click="visible = true"
      >
        <!-- 未济卦象：离上坎下，六爻自上而下阴阳交错 -->
        <span class="h-1 w-7 rounded-sm bg-sf-theme" />
        <span class="flex w-7 gap-3">
          <span class="h-1 flex-1 rounded-sm bg-sf-theme" />
          <span class="h-1 flex-1 rounded-sm bg-sf-theme" />
        </span>
        <span class="h-1 w-7 rounded-sm bg-sf-theme" />
        <span class="flex w-7 gap-3">
          <span class="h-1 flex-1 rounded-sm bg-sf-theme" />
          <span class="h-1 flex-1 rounded-sm bg-sf-theme" />
        </span>
        <span class="h-1 w-7 rounded-sm bg-sf-theme" />
        <span class="flex w-7 gap-3">
          <span class="h-1 flex-1 rounded-sm bg-sf-theme" />
          <span class="h-1 flex-1 rounded-sm bg-sf-theme" />
        </span>
      </div>
    </SfTooltip>
  </div>

  <!-- 六爻问心弹窗：正念呼吸引导 -->
  <SfModal v-model="visible" title="六爻问心">
    <div class="flex w-[400px] flex-col items-center gap-6 p-6">
      <!-- 呼吸圆：吸气放大、吐气回落 -->
      <div class="flex h-45 w-45 items-center justify-center">
        <div
          class="flex h-30 w-30 items-center justify-center rounded-full bg-gradient-to-br from-sf-theme to-sf-theme-2 text-sm tracking-widest text-sf-theme-text shadow-xl shadow-sf-theme-2 transition-transform ease-in-out"
          :class="[
            breathing ? 'duration-[3000ms]' : 'duration-700',
            phase === '吸气' ? 'scale-150' : phase === '吐气' ? 'scale-75' : 'scale-100',
          ]"
        >
          {{ phase || "正念" }}
        </div>
      </div>
      <!-- 开始按钮：点击后进入吸气 3 秒、吐气 3 秒的呼吸引导 -->
      <SfButton class="w-45" :disabled="breathing" @click="startBreathing">
        {{ buttonText }}
      </SfButton>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>

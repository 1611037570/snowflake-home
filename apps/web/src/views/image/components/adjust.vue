<template>
  <div class="mb-3 flex w-full flex-col" v-if="hasOriginalSize">
    <Title :name="$t('image.sizeAdjust')" reset @reset="reset">
      <template #right>
        <div class="flex items-center gap-1 text-xs">
          <span class="text-xs">{{ $t("image.keepAspect") }}</span>
          <ElSwitch v-model="keepAspectRatio" />
        </div>
      </template>
    </Title>
    <SfTab :list="sizeList" v-model="currentValue" @change="handleTabChange"></SfTab>
    <div class="my-3">预设尺寸</div>
    <ElSelect
      v-model="presetValue"
      placeholder="选择预设大小"
      class="mb-3"
      @change="handlePresetChange"
    >
      <ElOption
        v-for="item in presetList"
        :key="item.value"
        :label="item.name"
        :value="item.value"
      />
    </ElSelect>
    <!-- 像素模式（编辑本地值，失焦后提交） -->
    <template v-if="currentValue === 'pixel'">
      <div class="flex items-center gap-2">
        <span class="text-sf-secondary w-8 text-sm">{{ $t("image.width") }}</span>
        <ElInputNumber
          v-model="localW"
          :min="1"
          :max="initialW"
          @change="handleWidthChange"
          class="flex-1"
          :placeholder="$t('image.pixelPlaceholder')"
        />
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sf-secondary w-8 text-sm">{{ $t("image.height") }}</span>
        <ElInputNumber
          v-model="localH"
          :min="1"
          :max="initialH"
          @change="handleHeightChange"
          class="flex-1"
          :placeholder="$t('image.pixelPlaceholder')"
        />
      </div>
    </template>

    <!-- 百分比模式（单输入，失焦后提交） -->
    <template v-else>
      <div class="flex items-center gap-2">
        <span class="text-sf-secondary w-8 text-sm">{{ $t("image.ratio") }}</span>
        <ElInputNumber
          v-model="percent"
          :min="1"
          :max="100"
          class="flex-1"
          @change="handlePercentChange"
          :placeholder="$t('image.percentPlaceholder')"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { percentPresetList, shapePresetList } from "@/views/image/data";
import { computed, onMounted, ref } from "vue";
import Title from "./title.vue";

// ========== 基础变量定义 ==========
// 当前选择的尺寸模式
const currentValue = ref("pixel");
// 预设大小值
const presetValue = ref(undefined);
// 尺寸模式列表（抽离后无冗余）
const sizeList = [
  { name: "像素", value: "pixel" },
  { name: "百分比", value: "percent" },
];
// 控制是否保持宽高比（等比缩放）
const keepAspectRatio = ref(true);
// 百分比值（1-100）
const percent = ref(100);
// 本地编辑值（与父组件双向绑定的宽高解耦）
const localW = ref(0);
const localH = ref(0);

// ========== Props 定义 ==========
const props = defineProps({
  initialW: { type: Number, default: 0 },
  initialH: { type: Number, default: 0 },
});

// ========== 双向绑定 ==========
const width = defineModel("width", { type: Number, default: 0 });
const height = defineModel("height", { type: Number, default: 0 });

// ========== 计算属性（精简冗余逻辑） ==========
// 检查是否有有效的原始尺寸（合并重复变量判断）
const hasOriginalSize = computed(() => {
  return props.initialW > 0 && props.initialH > 0 && width.value > 0 && height.value > 0;
});

// 动态切换预设列表（无冗余）
const presetList = computed(() =>
  currentValue.value === "pixel" ? shapePresetList : percentPresetList,
);

// 判断初始形状是正方形/长方形（精简后逻辑更清晰）
const shape = computed(() => (props.initialW === props.initialH ? "square" : "rectangle"));

// ========== 工具函数（提取重复逻辑，减少冗余） ==========
/** 清空预设值（统一管理，避免重复写） */
const clearPresetValue = () => {
  presetValue.value = undefined;
};

/** 计算等比缩放后的尺寸 */
const calculateAspectRatio = (type, value) => {
  if (type === "width") {
    return Math.round((value / props.initialW) * props.initialH);
  }
  return Math.round((value / props.initialH) * props.initialW);
};

/** 计算百分比（基于初始尺寸和当前值） */
const calculatePercent = (w, h) => {
  const maxInitial = Math.max(props.initialW, props.initialH);
  const maxCurrent = Math.max(w, h);
  return Math.round((maxCurrent / maxInitial) * 100);
};

// ========== 事件处理函数（精简冗余逻辑） ==========
// 尺寸模式切换
const handleTabChange = () => {
  clearPresetValue();
};

// 预设值变更处理
const handlePresetChange = (newPresetValue) => {
  presetValue.value = newPresetValue;

  // 正方形逻辑（宽高相等）
  if (shape.value === "square") {
    localW.value = newPresetValue;
    localH.value = newPresetValue;
    width.value = newPresetValue;
    height.value = newPresetValue;
    percent.value = calculatePercent(newPresetValue, newPresetValue);
  } else {
    // 长方形逻辑（按最大维度赋值并计算等比）
    const isWidthLarger = props.initialW > props.initialH;
    if (isWidthLarger) {
      handleWidthChange(newPresetValue);
    } else {
      localH.value = newPresetValue;
      handleHeightChange(newPresetValue);
    }
    percent.value = calculatePercent(localW.value, localH.value);
  }
};

// 百分比变更处理
const handlePercentChange = (newPercent) => {
  clearPresetValue();
  console.log("newPercent", newPercent);
  localW.value = Math.round((props.initialW * newPercent) / 100);
  localH.value = Math.round((props.initialH * newPercent) / 100);
  width.value = localW.value;
  height.value = localH.value;
};

// 宽度变更处理
const handleWidthChange = (newWidth) => {
  clearPresetValue();
  localW.value = newWidth;
  width.value = newWidth;

  // 等比缩放处理（提取工具函数后无重复代码）
  if (keepAspectRatio.value) {
    localH.value = calculateAspectRatio("width", newWidth);
    height.value = localH.value;
  }
};

// 高度变更处理
const handleHeightChange = (newHeight) => {
  clearPresetValue();
  localH.value = newHeight;
  height.value = newHeight;

  // 等比缩放处理（提取工具函数后无重复代码）
  if (keepAspectRatio.value) {
    localW.value = calculateAspectRatio("height", newHeight);
    width.value = localW.value;
  }
};

// 还原原始尺寸
const reset = () => {
  localW.value = props.initialW;
  localH.value = props.initialH;
  width.value = props.initialW;
  height.value = props.initialH;
  percent.value = 100;
  clearPresetValue(); // 还原时清空预设值（补充遗漏的逻辑，同时统一调用）
};

// ========== 生命周期 ==========
onMounted(() => {
  localW.value = width.value;
  localH.value = height.value;
});
</script>

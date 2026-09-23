<script setup>
import { useResumeStore } from "@/stores";
import { allConfig } from "@/stores/modules/resume/formConfig";
import { DEFAULT_MODULE_NAMES } from "@/stores/modules/resume/defaultConfig";
import {
  bindCollapsedDefault,
  ensureRuntimeFieldIds,
} from "@/stores/modules/resume/hooks/useConfigTemplate";
import { jumpAll } from "../../../useModuleNav";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { getUUID } from "@/utils";
const resumeStore = useResumeStore();
const { runtimeConfig, currentData } = storeToRefs(resumeStore);
defineOptions({ name: "AddModule" });

// 预设模块列表：复用 DEFAULT_MODULE_NAMES 统一维护 key 与名称，user 为固定模块不可添加
const presets = DEFAULT_MODULE_NAMES.filter((item) => item.key !== "user").map((item) => ({
  name: item.name,
  value: item.key,
}));

// 过滤后的预设模块：只显示尚未添加到当前表单中的模块
const filteredPresets = computed(() => {
  if (!runtimeConfig.value) return presets;
  return presets.filter((item) => {
    // 检查运行时配置中是否已存在该模块
    return !runtimeConfig.value.fields.some((form) => form.key === item.value);
  });
});

const moduleOptions = computed(() => [
  ...filteredPresets.value,
  {
    name: "自定义模块",
    value: "custom",
  },
]);

const handleAdd = (module) => {
  const type = module.value;
  // 自定义模块需要特殊处理
  if (type === "custom") {
    handleConfirm();
    return;
  }
  if (type in allConfig) {
    const config = structuredClone(allConfig[type]);
    ensureRuntimeFieldIds([config]);
    // 新增模块内的记录默认折叠状态跟随系统设置
    bindCollapsedDefault([config], () => resumeStore.itemDefaultCollapsed);
    runtimeConfig.value.fields.push(config);
    // 新增模块落到列表末尾，同步定位编辑区与预览区
    jumpAll(type);
  }
};

const handleConfirm = () => {
  const customModuleName = "尚未填写";
  // 生成带前缀的唯一 key,作为模块标识与数据路径
  const customKey = `custom_${getUUID().substring(0, 8)}`;
  // 模块标题写入 ui，经历记录统一保存在 list 数组
  if (currentData.value) {
    currentData.value[customKey] = {
      ui: {
        title: customModuleName,
        collapsed: ["1"],
        hidden: false,
        archived: false,
      },
      list: [],
    };
  }
  // 深拷贝自定义模块配置
  const config = structuredClone(allConfig.custom);
  config.key = customKey;
  // 自定义模块进入实际数据节点，内部绑定继续使用相对路径
  config.context = [customKey];
  config.model.forEach((item) => {
    if (item.prop === "title") {
      item.defaultValue = customModuleName;
    }
  });
  ensureRuntimeFieldIds([config]);
  // 自定义模块内的记录默认折叠状态跟随系统设置
  bindCollapsedDefault([config], () => resumeStore.itemDefaultCollapsed);
  // 添加自定义模块到运行时配置
  runtimeConfig.value.fields.push(config);
  // 新增模块落到列表末尾，同步定位编辑区与预览区
  jumpAll(customKey);
};
</script>

<template>
  <header class="mt-2 mb-3 flex items-center text-lg font-bold">
    <SfIcon icon="ic:round-add" size="4" class="mr-1" />
    <div>增加模块</div>
  </header>

  <div class="flex flex-wrap gap-3">
    <button
      v-for="item in moduleOptions"
      :key="item.name"
      type="button"
      class="border-sf-border flex h-7 cursor-pointer items-center justify-center gap-1 rounded-3xl border bg-sf-primary px-2 text-xs text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
      :class="item.value === 'custom' ? 'border-dashed' : ''"
      @click="handleAdd(item)"
    >
      <SfIcon icon="ic:round-add" size="4" />
      <span>
        {{ item.name }}
      </span>
    </button>
  </div>
</template>

<style scoped></style>

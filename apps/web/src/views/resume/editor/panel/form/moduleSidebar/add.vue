<script setup>
import { useResumeStore } from "@/stores";
import { allConfig } from "@/stores/modules/resume/config/formConfig";
import { DEFAULT_MODULE_NAMES } from "@/stores/modules/resume/config/defaultConfig";
import {
  bindCollapsedDefault,
  ensureRuntimeFieldIds,
} from "@/stores/modules/resume/hooks/useConfigTemplate";
import { jumpAll } from "../../../hooks/useModuleNav";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { getUUID } from "@/utils";
import i18n from "@/locales";
import { translateResumeEditorText } from "@/stores/modules/resume/hooks/useResumeEditorLocale";
const resumeStore = useResumeStore();
const { runtimeConfig, currentData } = storeToRefs(resumeStore);
defineOptions({ name: "AddModule" });

// 常用模块与一键添加共用此列表，实习经历保留在其他模块中手动添加。
const BASIC_MODULE_KEYS = ["skill", "education", "project", "work"];

// 不可手动添加的模块：user 为固定模块，slogan 由主题槽位决定是否渲染
const EXCLUDED_MODULE_KEYS = ["user", "slogan"];

// 预设模块列表：复用 DEFAULT_MODULE_NAMES 统一维护 key 与名称
const presets = computed(() => {
  // 模块名称只做界面翻译，模块 key 仍作为稳定业务标识
  i18n.global.locale.value;
  return DEFAULT_MODULE_NAMES.filter((item) => !EXCLUDED_MODULE_KEYS.includes(item.key)).map(
    (item) => ({
      name: translateResumeEditorText(item.name),
      value: item.key,
    }),
  );
});

// 过滤后的预设模块：只显示尚未添加到当前表单中的模块
const availableModules = computed(() => {
  if (!runtimeConfig.value) return presets.value;
  return presets.value.filter((item) => {
    // 检查运行时配置中是否已存在该模块
    return !runtimeConfig.value.fields.some((form) => form.key === item.value);
  });
});

const basicModules = computed(() =>
  BASIC_MODULE_KEYS.flatMap((key) => {
    const item = availableModules.value.find((module) => module.value === key);
    return item ? [item] : [];
  }),
);
const otherModules = computed(() =>
  availableModules.value.filter((item) => !BASIC_MODULE_KEYS.includes(item.value)),
);
const handleAdd = (module) => {
  // 添加后面板保持展开：可连续添加多个模块，已添加的模块会自动从候选中消失
  const type = module.value;
  // 自定义模块需要特殊处理
  if (type === "custom") {
    handleConfirm();
    return;
  }
  if (type in allConfig) {
    // 预设模块由编辑器统一展开，新增入口只负责定位。
    if (resumeStore.addModule(type)) jumpAll(type);
  }
};

// 一键添加：常用模块一次性全部加入，数组模块顺带建好第一条记录，实现快速创建
const handleAddAll = () => {
  // 先快照候选列表，添加过程中候选会实时收敛，不能边加边遍历计算值
  const targets = basicModules.value;
  if (!targets.length) return;
  let firstAdded = "";
  targets.forEach((module) => {
    if (!resumeStore.addModule(module.value)) return;
    // 数组模块（教育/项目/工作等）预建第一条子记录，打开即可直接填写
    resumeStore.addDataRecord(module.value);
    firstAdded ||= module.value;
  });
  // 定位到第一个新模块，接着即可填写
  if (firstAdded) jumpAll(firstAdded);
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
  <!-- 入口高度随内容撑开，间距统一由侧栏容器控制。 -->
  <div class="w-full">
    <SfDropdown
      class="w-full"
      trigger="click"
      placement="top-start"
      :show-arrow="false"
      popper-class="resume-add-module-dropdown"
    >
      <button
        type="button"
        class="rail-action flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-3xl p-1 text-[12px] text-sf-text-2 transition-colors select-none hover:bg-sf-bg"
      >
        <SfIcon icon="ic:round-add" size="4" />
        <span class="max-md:hidden">{{ $t("addModule") }}</span>
      </button>
      <template #dropdown>
        <div
          class="flex w-60 flex-col gap-3 rounded-2xl border border-sf-b bg-sf-primary p-3 shadow-lg"
        >
          <div v-if="basicModules.length" class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-xs text-sf-text-3">{{ $t("basicModules") }}</span>
              <button
                type="button"
                class="flex h-5 cursor-pointer items-center gap-1 rounded-3xl px-1.5 text-xs text-sf-theme transition-colors select-none hover:bg-sf-theme-3"
                @click="handleAddAll"
              >
                <SfIcon icon="ic:round-add" size="3" />
                <span>{{ $t("addAllModules") }}</span>
              </button>
            </div>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="item in basicModules"
                :key="item.name"
                type="button"
                class="flex h-7 cursor-pointer items-center justify-center gap-1 rounded-3xl border border-sf-b bg-sf-primary px-2 text-xs text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
                @click="handleAdd(item)"
              >
                <SfIcon icon="ic:round-add" size="4" />
                <span>{{ item.name }}</span>
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-3">
            <span class="text-xs text-sf-text-3">{{ $t("otherModules") }}</span>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="item in otherModules"
                :key="item.name"
                type="button"
                class="flex h-7 cursor-pointer items-center justify-center gap-1 rounded-3xl border border-sf-b bg-sf-primary px-2 text-xs text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
                @click="handleAdd(item)"
              >
                <SfIcon icon="ic:round-add" size="4" />
                <span>{{ item.name }}</span>
              </button>
              <button
                type="button"
                class="flex h-7 w-fit cursor-pointer items-center justify-center gap-1 rounded-3xl border border-dashed border-sf-b bg-sf-primary px-2 text-xs text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
                @click="handleAdd({ value: 'custom' })"
              >
                <SfIcon icon="ic:round-add" size="4" />
                <span>{{ $t("customModule") }}</span>
              </button>
            </div>
          </div>
        </div>
      </template>
    </SfDropdown>
  </div>
</template>

<style scoped></style>

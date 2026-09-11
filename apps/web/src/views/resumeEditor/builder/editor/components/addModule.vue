<script setup>
import { useResumeStore } from "@/stores";
import { allConfig } from "@/stores/modules/resume/formConfig";
import { DEFAULT_MODULE_NAMES } from "@/stores/modules/resume/defaultConfig";
import { bindCollapsedDefault } from "@/stores/modules/resume/hooks/useConfigTemplate";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
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
    showModal.value = true;
    return;
  }
  if (type in allConfig) {
    const config = structuredClone(allConfig[type]);
    // 新增模块内的记录默认折叠状态跟随系统设置
    bindCollapsedDefault([config], () => resumeStore.itemDefaultCollapsed);
    runtimeConfig.value.fields.push(config);
  }
};

const showModal = ref(false);
const customModuleName = ref("");

const handleConfirm = () => {
  // 校验自定义模块名称是否为空
  if (!customModuleName.value) return;
  // 生成带前缀的唯一 key,作为模块标识与数据路径
  const customKey = `custom_${getUUID().substring(0, 8)}`;
  // 模块标题写入 ui，经历记录继续保存在 data.list
  if (currentData.value) {
    currentData.value[customKey] = {
      collapsed: ["1"],
      hidden: false,
      archived: false,
      ui: {
        title: customModuleName.value,
      },
      data: {
        list: [],
      },
    };
  }
  // 深拷贝自定义模块配置
  const config = structuredClone(allConfig.custom);
  config.key = customKey;
  // 重置自定义模块顶层模型的数据路径，并写入标题默认值
  config.model.forEach((item) => {
    item.source[0] = customKey;
    if (item.prop === "title") {
      item.defaultValue = customModuleName.value;
    }
  });
  // 重置自定义模块的条件校验配置数据路径
  if (config.checks?.muted?.path?.length) {
    config.checks.muted.path[0] = customKey;
  }
  if (config.checks?.visible?.path?.length) {
    config.checks.visible.path[0] = customKey;
  }
  // 重置自定义模块的子模块标题模型数据路径
  config.fields[0].addConfig.model.forEach((item) => {
    item.source[0] = customKey;
  });
  // 重置自定义模块的子项字段列表数据路径
  config.fields[0].addConfig.fields.forEach((field) => {
    field.model.source[0] = customKey;
  });
  // 自定义模块内的记录默认折叠状态跟随系统设置
  bindCollapsedDefault([config], () => resumeStore.itemDefaultCollapsed);
  // 添加自定义模块到运行时配置
  runtimeConfig.value.fields.push(config);

  handleCancel();
};

const handleCancel = () => {
  showModal.value = false;
  customModuleName.value = "";
};
</script>

<template>
  <header class="mt-2 mb-3 flex items-center text-lg font-bold">
    <SfIcon icon="ic:round-add" size="4" class="mr-1" />
    <div>增加模块</div>
  </header>

  <div class="grid grid-cols-2 gap-2">
    <button
      v-for="item in moduleOptions"
      :key="item.name"
      type="button"
      class="group flex h-10 cursor-pointer items-center justify-center gap-2 rounded-3xl border border-sf-b bg-sf-bg px-3 text-sm font-medium text-sf-text-2 transition-all duration-200 hover:bg-sf-theme"
      @click="handleAdd(item)"
    >
      <SfIcon icon="ic:round-add" size="5" class="text-sf-text-3 group-hover:text-sf-primary" />
      <span class="truncate group-hover:text-sf-primary">
        {{ item.name }}
      </span>
    </button>
  </div>

  <SfModal v-model="showModal" title="自定义模块">
    <form class="flex w-80 flex-col gap-3 p-3" @submit.prevent="handleConfirm">
      <SfInput v-model="customModuleName" placeholder="请输入模块名称" />
      <footer class="flex justify-end gap-3">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :disabled="!customModuleName" @click="handleConfirm"
          >保存</el-button
        >
      </footer>
    </form>
  </SfModal>
</template>

<style scoped></style>

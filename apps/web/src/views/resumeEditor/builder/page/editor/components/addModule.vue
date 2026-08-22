<script setup>
import { useResumeStore } from "@/stores";
import { allConfig } from "@/stores/modules/resume/formConfig";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { getUUID } from "@/utils";
const resumeStore = useResumeStore();
const { currentConfig } = storeToRefs(resumeStore);
defineOptions({ name: "AddModule" });

// 预设模块列表
const presets = ref([
  {
    name: "教育经历",
    value: "education",
  },
  {
    name: "社交账号",
    value: "account",
  },
  { name: "专业技能", value: "skill" },
  { name: "工作经历", value: "work" },
  { name: "项目经历", value: "project" },
  { name: "个人优势", value: "advantage" },
  { name: "兴趣爱好", value: "hobbies" },
  { name: "图片作品", value: "images" },
  { name: "实习经历", value: "intern" },
  { name: "志愿服务经历", value: "volunteer" },
  { name: "社团经历", value: "club" },
  { name: "荣誉奖项", value: "awards" },
  { name: "视频作品", value: "videos" },
  { name: "资格证书", value: "certs" },
]);

// 过滤后的预设模块：只显示尚未添加到当前表单中的模块
const filteredPresets = computed(() => {
  if (!currentConfig.value) return presets.value;
  return presets.value.filter((item) => {
    // 检查当前表单配置中是否已存在该模块（通过比对模块名称与表单首项的 label）
    return !currentConfig.value.fields.some((form) => form.key === item.value);
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
    currentConfig.value.fields.push(structuredClone(allConfig[type]));
  }
};

const showModal = ref(false);
const customModuleName = ref("");

const handleConfirm = () => {
  // 校验自定义模块名称是否为空
  if (!customModuleName.value) return;
  // 生成带前缀的唯一 key,作为模块标识与数据路径
  const customKey = `custom_${getUUID().substring(0, 8)}`;
  // 深拷贝自定义模块配置
  const config = structuredClone(allConfig.custom);
  config.key = customKey;
  // 重置自定义模块的名称
  config.name = customModuleName.value;
  // 重置自定义模块的标题
  config.props.title = customModuleName.value;
  config.model.source = [customKey];
  // 重置自定义模块的子模块
  config.fields[0].addConfig.model.forEach((item) => {
    item.source[0] = customKey;
  });
  // 添加自定义模块到当前表单配置
  currentConfig.value.fields.push(structuredClone(config));

  handleCancel();
};

const handleCancel = () => {
  showModal.value = false;
  customModuleName.value = "";
};
</script>

<template>
  <header class="mt-3 mb-2 flex items-center text-lg font-bold text-sf-base">
    <SfIcon icon="ic:round-add" size="5" />
    <div>增加模块</div>
  </header>

  <div class="grid grid-cols-2 gap-2">
    <button
      v-for="item in moduleOptions"
      :key="item.name"
      type="button"
      class="group flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-sf-b bg-sf-primary px-3 text-sm font-medium text-sf-text-2 transition-all duration-200 hover:border-sf-theme hover:bg-sf-theme hover:text-sf-primary hover:shadow-sm"
      @click="handleAdd(item)"
    >
      <SfIcon icon="ic:round-add" size="5" class="text-sf-text-3 group-hover:text-sf-primary" />
      <span class="truncate group-hover:text-sf-primary">
        {{ item.name }}
      </span>
    </button>
  </div>

  <SfModal v-model="showModal" title="自定义模块">
    <form class="flex w-80 flex-col gap-4 p-5" @submit.prevent="handleConfirm">
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

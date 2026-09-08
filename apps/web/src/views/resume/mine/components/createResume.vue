<script setup>
import { useResumeStore } from "@/stores";
import { themeTemplateList } from "@/stores/modules/resume/uiConfig";
import { xiaoYangResumeItem } from "@/stores/modules/resume/xiaoYangData";
import { useRouter } from "vue-router";
import ResumeCardContainer from "./resumeCardContainer.vue";

const resumeStore = useResumeStore();
const router = useRouter();

const visible = ref(false);
const mode = ref("options");
const form = ref({ name: "", phone: "", position: "" });

// 新建入口仅展示三种创建方式，信息收集按需进入。
const createOptions = [
  {
    key: "blank",
    title: "从 0 开始",
    description: "直接进入简历编辑器",
    icon: "lucide:file-text",
  },
  {
    key: "quick",
    title: "快速开始",
    description: "先填写基础信息",
    icon: "fa6-solid:rocket",
  },
  {
    key: "template",
    title: "使用模板",
    description: "从模板开始编辑",
    icon: "lucide:layout-template",
  },
];

// 模板数据与简历模板页保持一致，仅展示前六条。
const templates = computed(() =>
  themeTemplateList.slice(0, 6).map((style) => ({
    id: style.value,
    name: style.name,
    value: style.value,
    item: {
      data: xiaoYangResumeItem.data,
      config: xiaoYangResumeItem.config,
      ui: { ...xiaoYangResumeItem.ui, themeTemplate: style.value },
    },
  })),
);

const reset = () => {
  mode.value = "options";
  form.value = { name: "", phone: "", position: "" };
};

const close = () => {
  visible.value = false;
};

watch(visible, (value) => {
  if (!value) reset();
});

const open = () => {
  if (resumeStore.list.length >= resumeStore.maxCount) {
    ElMessage.warning(`简历数量已达上限（${resumeStore.maxCount}个），请先删除后再新建`);
    return;
  }
  visible.value = true;
};

const selectOption = (key) => {
  if (key === "blank") {
    resumeStore.addResume();
    close();
    return;
  }
  mode.value = key;
};

const createQuickResume = () => {
  const { name, phone, position } = form.value;
  resumeStore.addResume({
    data: {
      user: {
        data: {
          name: name.trim(),
          phone: phone.trim(),
          position: position.trim(),
        },
      },
    },
  });
  close();
};

const useTemplate = (template) => {
  resumeStore.addResume({
    data: structuredClone(xiaoYangResumeItem.data),
    config: structuredClone(xiaoYangResumeItem.config),
    ui: { ...xiaoYangResumeItem.ui, themeTemplate: template.value },
  });
  close();
};

const goTemplate = () => {
  close();
  router.push("/resume/template");
};
</script>

<template>
  <ResumeCardContainer @click="open">
    <div class="group flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden">
      <div class="flex h-15 w-15 items-center justify-center rounded-full bg-sf-theme-2">
        <SfIcon
          icon="ic:round-add"
          size="8"
          class="text-sf-theme transition-transform duration-300 group-hover:rotate-90"
        />
      </div>
      <span class="text-base font-black text-sf-text">新建简历</span>
      <span class="text-sm text-sf-text-2">选择适合你的创建方式</span>
    </div>
  </ResumeCardContainer>

  <SfModal v-model="visible" title="新建简历">
    <div v-if="mode === 'options'" class="flex w-[672px] flex-col gap-3 p-6">
      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="item in createOptions"
          :key="item.key"
          class="flex flex-col items-start gap-3 rounded-2xl border border-sf-b bg-sf-primary p-6 text-left transition-colors hover:border-sf-theme"
          type="button"
          @click="selectOption(item.key)"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-sf-theme-2">
            <SfIcon :icon="item.icon" size="6" class="text-sf-theme" />
          </div>
          <span class="text-base font-black text-sf-text">{{ item.title }}</span>
          <span class="text-sm text-sf-text-2">{{ item.description }}</span>
        </button>
      </div>
    </div>

    <form v-else-if="mode === 'quick'" class="flex w-96 flex-col gap-3 p-6" @submit.prevent="createQuickResume">
      <div class="flex items-center gap-3">
        <SfButton plain @click="mode = 'options'">返回</SfButton>
        <span class="text-base font-black text-sf-text">填写基础信息</span>
      </div>
      <SfInput v-model="form.name" placeholder="请输入姓名" />
      <SfInput v-model="form.phone" placeholder="请输入电话" />
      <SfInput v-model="form.position" placeholder="请输入求职岗位" />
      <footer class="flex justify-end gap-3">
        <SfButton plain @click="close">取消</SfButton>
        <SfButton type="primary" @click="createQuickResume">进入编辑器</SfButton>
      </footer>
    </form>

    <div v-else class="flex w-[768px] flex-col gap-3 p-6">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <SfButton plain @click="mode = 'options'">返回</SfButton>
          <span class="text-base font-black text-sf-text">选择简历模板</span>
        </div>
        <SfButton plain @click="goTemplate">查看更多</SfButton>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <ResumeCardContainer
          v-for="template in templates"
          :key="template.id"
          :item="template.item"
          class="h-[276px]! w-full!"
          @click="useTemplate(template)"
        >
          <div class="truncate text-sm font-black text-black">{{ template.name }}</div>
        </ResumeCardContainer>
      </div>
    </div>
  </SfModal>
</template>

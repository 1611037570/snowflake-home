<script setup>
import { computed, ref } from "vue";
import WangEditor from "@/components/business/wangEditor";
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import TemplateExamplePicker from "./templateExamplePicker.vue";
import { loadResumeExamples } from "@/views/resume/template/data/resumeExamples";

defineOptions({ name: "ResumeContentEditor" });

const content = defineModel("modelValue", {
  type: String,
  default: "",
});
const props = defineProps({
  kind: { type: String, default: "work" },
});

const resumeStore = useResumeStore();
const { currentData } = storeToRefs(resumeStore);
// 所有范例都按个人信息中的求职岗位匹配，避免使用经历自身的岗位或项目名称。
const targetPosition = computed(() => currentData.value?.user?.data?.position ?? "");
const examples = ref([]);
const isLoading = ref(false);

const loadExamples = async () => {
  if (examples.value.length || isLoading.value) return;
  isLoading.value = true;
  try {
    examples.value = await loadResumeExamples(props.kind);
  } finally {
    isLoading.value = false;
  }
};

const appendExample = (example) => {
  // 选择范例时保留当前编辑内容，并追加对应字段的富文本。
  const currentContent = String(content.value ?? "").trim();
  content.value = `${currentContent}${example.content}`;
};
</script>

<template>
  <div class="w-full">
    <WangEditor v-model="content">
      <template #toolbar>
        <TemplateExamplePicker
          :examples="examples"
          :kind="props.kind"
          :search-term="targetPosition"
          :loading="isLoading"
          @open="loadExamples"
          @select="appendExample"
        />
      </template>
    </WangEditor>
  </div>
</template>

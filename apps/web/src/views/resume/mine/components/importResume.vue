<script setup>
import { useResumeStore } from "@/stores";
import { ref } from "vue";

const visible = ref(false);
const resumeStore = useResumeStore();

const { click } = useFileDialog({
  accept: ".json,application/json",
  multiple: false,
  maxCount: 1,
});

// 选择 JSON 配置文件
const importJsonConfig = async () => {
  visible.value = false;
  try {
    // click 返回合法文件列表，用户取消选择时会 reject
    const successList = await click();
    const file = successList?.[0]?.file;
    if (file) {
      await parseJsonConfig(file);
    }
  } catch (error) {
    // 用户取消选择，忽略即可
  }
};

// 读取并解析 JSON 配置，导入为新简历并进入编辑器
const parseJsonConfig = async (file) => {
  if (!file) return;
  try {
    const config = JSON.parse(await file.text());
    // 以解析出的配置创建新简历（addResume 会与默认结构合并并跳转编辑器）
    resumeStore.addResume({ config });
  } catch (error) {
    console.error("解析简历配置失败:", error);
    ElMessage.error("简历配置解析失败，请检查文件格式");
  }
};
</script>

<template>
  <SfButton @click="visible = true">
    <SfIcon icon="fa6-solid:file-import" size="4" class="mr-2" />
    导入简历
  </SfButton>
  <SfModal v-model="visible" title="导入简历">
    <div class="flex w-[400px] flex-col gap-3">
      <div
        class="cursor-pointer rounded-3xl border border-sf-b p-3 transition-colors hover:bg-sf-theme-2"
        @click="importJsonConfig"
      >
        <div class="text-xl">JSON配置</div>
        <div class="text-sm">选择并解析简历配置文件</div>
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>

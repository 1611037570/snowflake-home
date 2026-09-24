<script setup>
import { useFileDialog } from "@/hooks";
import { parseMarkdownResume } from "../markdownParser";
import { useResumeStore } from "@/stores";
import { ref } from "vue";

const visible = ref(false);
const parsing = ref(false);
const resumeStore = useResumeStore();

const { click: clickJson } = useFileDialog({
  accept: ".json,application/json",
  multiple: false,
  maxCount: 1,
});
const { click: clickMarkdown } = useFileDialog({
  accept: ".md,.markdown,text/markdown",
  multiple: false,
  maxCount: 1,
});

// 打开导入弹窗：提前判断简历数量是否已达上限
const handleOpenImport = () => {
  if (resumeStore.resumeList.length >= resumeStore.maxCount) {
    ElMessage.warning(`简历数量已达上限（${resumeStore.maxCount}个），请先删除后再导入`);
    return;
  }
  visible.value = true;
};
// 选择 JSON 配置文件
const importJsonConfig = async () => {
  visible.value = false;
  try {
    // click 返回合法文件列表，用户取消选择时会 reject
    const successList = await clickJson();
    const file = successList?.[0]?.file;
    if (file) {
      await parseJsonConfig(file);
    }
  } catch {
    // 用户取消选择，忽略即可
  }
};

// 读取并解析完整简历 JSON，导入为新简历（仅创建不跳转，成功后提示）
const parseJsonConfig = async (file) => {
  if (!file) return;
  try {
    const item = JSON.parse(await file.text());
    // 以解析出的完整简历创建新简历，jump=false 避免跳转编辑器
    const ok = resumeStore.addResume(item, false);
    if (ok) ElMessage.success("简历导入成功");
  } catch (error) {
    console.error("解析简历文件失败:", error);
    ElMessage.error("简历文件解析失败，请检查文件格式");
  }
};

// 读取 Markdown 内容并调用智能解析模型，解析成功后创建新简历。
const importMarkdownConfig = async () => {
  try {
    const successList = await clickMarkdown();
    const file = successList?.[0]?.file;
    if (!file) return;
    parsing.value = true;
    const item = await parseMarkdownResume(await file.text());
    const ok = resumeStore.addResume(item, false);
    if (ok) ElMessage.success("简历导入成功");
  } catch (error) {
    console.error("解析 Markdown 简历失败:", error);
    const message = error instanceof Error ? error.message : "";
    ElMessage.error(message || "简历智能解析失败，请检查文件内容或模型配置");
  } finally {
    parsing.value = false;
    visible.value = false;
  }
};
</script>

<template>
  <SfButton @click="handleOpenImport">
    <SfIcon icon="fa6-solid:file-import" size="4" class="mr-2" />
    导入简历
  </SfButton>
  <SfModal v-model="visible" title="导入简历">
    <div v-if="parsing" class="flex w-[400px] flex-col items-center gap-3 p-6">
      <SfIcon icon="line-md:loading-twotone-loop" size="8" class="text-sf-theme" />
      <div class="text-base">正在智能解析简历，请稍候</div>
    </div>
    <div v-else class="flex w-[400px] flex-col gap-3">
      <div
        class="cursor-pointer rounded-3xl border border-sf-b p-3 transition-colors hover:bg-sf-theme-2"
        @click="importJsonConfig"
      >
        <div class="text-xl">JSON完整备份</div>
        <div class="text-sm">选择并解析完整简历备份文件</div>
      </div>
      <div
        class="cursor-pointer rounded-3xl border border-sf-b p-3 transition-colors hover:bg-sf-theme-2"
        @click="importMarkdownConfig"
      >
        <div class="flex items-center gap-3">
          <SfIcon icon="ph:file-md-duotone" size="6" class="text-sf-theme" />
          <div>
            <div class="text-xl">智能解析简历</div>
            <div class="text-sm">识别 Markdown 内容并转换为简历</div>
          </div>
        </div>
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>

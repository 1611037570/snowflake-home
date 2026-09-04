<script setup>
import { ref } from "vue";

const visible = ref(false);

const { open, onChange } = useFileDialog({
  accept: ".json,application/json",
  multiple: false,
});

// 选择 JSON 配置文件
const importJsonConfig = () => {
  visible.value = false;
  open();
};

// 读取并解析 JSON 配置，暂时输出供后续处理
const parseJsonConfig = async (file) => {
  if (!file) return;

  try {
    const config = JSON.parse(await file.text());
    console.log("导入的简历配置:", config);
  } catch (error) {
    console.error("解析简历配置失败:", error);
  }
};

onChange((files) => parseJsonConfig(files?.[0]));
</script>

<template>
  <SfButton @click="visible = true">
    <SfIcon icon="fa6-solid:file-import" size="4" class="mr-2" />
    投递简历
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

<script setup>
import { computed } from "vue";
import ResumeField from "../components/resumeField/index.vue";
import { getValidData } from "./validData";
import Title from "../components/title/index.vue";
import ItemTitle from "../components/itemTitle.vue";
import { useResumePreviewContext } from "../previewContext";
import ModuleContentContainer from "../components/moduleContentContainer.vue";

// 社交账号模块统一读取预览共享上下文。
const {
  data: previewData,
  theme: { fontValue, lineHeightValue, paragraphSpacingStyle, linkUnderline },
} = useResumePreviewContext();

// 数组记录统一由 getValidData 过滤并提取业务内容
const account = computed(() => getValidData(previewData.value?.account?.list || []));

// 仅允许安全的外部链接协议
const safeUrl = (value) => {
  if (!value) return "";
  try {
    const url = new URL(String(value).trim());
    return ["http:", "https:", "mailto:"].includes(url.protocol.toLowerCase()) ? url.href : "";
  } catch {
    return "";
  }
};
</script>

<template>
  <div
    class="resume-row flex flex-col"
    data-module="account"
    :style="[lineHeightValue(), fontValue()]"
  >
    <Title module-key="account"></Title>
    <!-- 社交链接 -->
    <ModuleContentContainer v-if="account.length">
      <div
        v-for="(item, index) in account"
        :key="index"
        class="flex max-w-full min-w-0 items-center"
        data-module="user"
        :style="paragraphSpacingStyle"
      >
        <span v-if="item.name" class="shrink-0 whitespace-nowrap">
          <ItemTitle :name="item.name" class="inline-block" />
          <span v-if="item.url">：</span>
        </span>
        <div class="flex min-w-0 flex-1 items-center overflow-hidden">
          <a
            :href="safeUrl(item.url)"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block max-w-full truncate whitespace-nowrap hover:underline"
            :class="{ underline: linkUnderline }"
          >
            <ResumeField
              :model-value="item.url"
              class="flex max-w-full items-center truncate whitespace-nowrap hover:underline"
              boxClass="truncate"
              :class="{ underline: linkUnderline }"
            />
          </a>
        </div>
      </div>
    </ModuleContentContainer>
  </div>
</template>

<style lang="scss" scoped></style>

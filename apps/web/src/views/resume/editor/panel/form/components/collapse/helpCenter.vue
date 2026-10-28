<script setup>
import { computed, ref } from "vue";
import { DEFAULT_MODULE_NAMES } from "@/stores/modules/resume/config/defaultConfig";

const props = defineProps({
  // 稳定模块标识，用于选择对应的写作说明与问答。
  moduleKey: { type: String, default: "" },
  // 当前展示标题，保持与用户重命名后的模块一致。
  moduleTitle: { type: String, default: "" },
});
// 弹窗状态与问答展开状态仅保存在当前组件内，不写入简历。
const visible = defineModel({ type: Boolean, default: false });
const expandedQuestions = ref([]);
// 自定义模块使用通用写作指引，预设模块按稳定标识匹配内容。
const helpKey = computed(() =>
  DEFAULT_MODULE_NAMES.some((module) => module.key === props.moduleKey)
    ? props.moduleKey
    : "custom",
);
</script>

<template>
  <SfModal
    v-model="visible"
    :title="$t('moduleHelpCenter')"
    title-class="text-base! font-normal!"
    width="560px"
  >
    <div class="flex max-h-[66vh] flex-col gap-3 overflow-y-auto text-sf-text">
      <p class="text-base font-normal">
        {{ $t("moduleHelpTitle", { name: moduleTitle }) }}
      </p>
      <p class="text-sm leading-6 text-sf-text-2">
        {{ $t(`moduleHelp_${helpKey}_description`) }}
      </p>
      <p class="text-sm font-normal">{{ $t("moduleHelpQuestions") }}</p>
      <!-- 常见问答默认收起，沿用项目统一折叠组件。 -->
      <SfCollapse v-model="expandedQuestions" :border="false">
        <SfCollapseItem v-for="index in 2" :key="index" :name="index">
          <template #title>
            <span class="pr-3 text-sm font-normal text-sf-text">
              {{ $t(`moduleHelp_${helpKey}_question${index}`) }}
            </span>
          </template>
          <p class="text-sm leading-6 text-sf-text-2">
            {{ $t(`moduleHelp_${helpKey}_answer${index}`) }}
          </p>
        </SfCollapseItem>
      </SfCollapse>
    </div>
  </SfModal>
</template>

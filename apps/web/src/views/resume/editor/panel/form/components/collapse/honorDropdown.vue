<script setup>
import { computed } from "vue";
import { useResumeStore } from "@/stores";
import { honorTemplateList } from "@/domain/resume/theme/uiConfig";
import ColorTags from "@/views/resume/theme/components/tagTemplate/colorTags.vue";
import Icon from "../icon.vue";
const resumeStore = useResumeStore();

// 荣誉布局保存在简历 ui.honor，标签布局只影响预览内容。
const honorLayout = computed({
  get: () => resumeStore.currentUI?.honor?.layout ?? "default",
  set: (value) => {
    resumeStore.currentUI.honor.layout = value;
  },
});
// 荣誉模板的示例名称与描述共用同一组内容。
const mockHonor = {
  name: "国家奖学金", // 示例荣誉名称
  desc: "学习表现优秀", // 示例荣誉描述
  linkName: "获奖公告", // 示例荣誉链接名称
};
</script>

<template>
  <span class="flex items-center" @click.stop @mousedown.stop>
    <SfDropdown
      trigger="click"
      placement="bottom-start"
      :show-arrow="false"
      :hide-on-click="false"
    >
      <SfTooltip :content="$t('honorTemplate')">
        <Icon
          click-through
          icon="lucide:layout-template"
          :aria-label="$t('honorTemplate')"
          aria-haspopup="menu"
        />
      </SfTooltip>
      <template #dropdown>
        <div
          class="flex w-[360px] max-w-[90vw] flex-col gap-3 rounded-3xl border border-sf-b bg-sf-primary p-3"
        >
          <p class="text-xs font-normal text-sf-text-2">{{ $t("honorTemplate") }}</p>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="option in honorTemplateList"
              :key="option.value"
              class="flex cursor-pointer flex-col items-center gap-3"
              @click="honorLayout = option.value"
            >
              <!-- 与技能模板一致，示例置于描边卡片内，名称置于卡片外。 -->
              <div
                class="flex w-full flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-3 border-sf-transparent bg-sf-bg p-3 text-center"
                :class="{ 'border-sf-theme!': honorLayout === option.value }"
              >
                <ColorTags
                  v-if="option.value === 'notion' || option.value === 'rainbowTag'"
                  :items="[mockHonor]"
                  :variant="option.value === 'notion' ? 'notion' : 'rainbowTag'"
                  sample
                />
                <template v-if="option.value === 'default'">
                  <span class="text-xs text-sf-text">{{ mockHonor.name }}</span>
                  <span class="text-xs text-sf-text-2">{{ mockHonor.desc }}</span>
                </template>
                <span
                  v-else-if="option.value === 'tag'"
                  class="rounded-3xl bg-sf-theme-3 px-3 py-[3px] text-xs text-sf-theme"
                  >{{ mockHonor.name }}</span
                >
                <span
                  v-else-if="option.value === 'list'"
                  class="flex items-center gap-3 text-xs text-sf-text"
                  ><span class="text-sf-theme">•</span>{{ mockHonor.name }}</span
                >
                <span
                  v-else-if="option.value === 'card'"
                  class="flex w-full flex-col gap-3 rounded-xl border border-sf-b bg-sf-primary p-3 text-left text-xs"
                >
                  <span class="font-semibold text-sf-text">{{ mockHonor.name }}</span>
                  <span class="text-sf-text-2">{{ mockHonor.desc }}</span>
                  <span class="text-sf-theme">{{ mockHonor.linkName }}</span>
                </span>
              </div>
              <span
                class="text-center text-xs"
                :class="
                  honorLayout === option.value ? 'text-sf-theme' : 'text-sf-text-2'
                "
                >{{ $t(option.labelKey) }}</span
              >
            </div>
          </div>
        </div>
      </template>
    </SfDropdown>
  </span>
</template>

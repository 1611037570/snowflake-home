<script setup>
import { computed } from "vue";
import { useResumeStore } from "@/stores";
import { skillTemplateList } from "@/domain/resume/theme/uiConfig";
import SkillTemplate from "@/views/resume/theme/components/skillTemplate/index.vue";
import DistributionTemplate from "@/views/resume/theme/components/skillTemplate/distribution.vue";
import ColorTags from "@/views/resume/theme/components/tagTemplate/colorTags.vue";
import Icon from "../icon.vue";
const resumeStore = useResumeStore();

// 技能布局与列数保存在简历 ui.skill，模板编号与标题模板同属 ui.theme。
const layout = computed({
  get: () => resumeStore.currentUI?.skill?.layout ?? "proficiency",
  set: (value) => {
    resumeStore.currentUI.skill.layout = value;
  },
});
const skillColumns = computed({
  get: () => resumeStore.currentUI?.skill?.columns ?? 1,
  set: (value) => {
    resumeStore.currentUI.skill.columns = value;
  },
});
const skillTemplate = computed({
  get: () => resumeStore.currentUI?.theme?.skillTemplate ?? "none",
  set: (value) => {
    resumeStore.currentUI.theme.skillTemplate = value;
  },
});
// 技能样式示例共用同一名称与十分制评分。
const mockSkill = {
  name: "Vue 是最好的语言", // 示例技能名称
  desc: "熟悉组件开发", // 示例技能描述
  level: 7, // 示例技能评分
};
// 占比模板示例使用多项技能，以展示整条比例条和图例。
const mockDistributionSkills = [
  { name: "Vue" /* 示例技能名称 */, level: 6 /* 示例技能评分 */ },
  { name: "TypeScript" /* 示例技能名称 */, level: 4 /* 示例技能评分 */ },
];
// 彩色标签示例展示不同技能的交替配色。
const mockNotionSkills = [
  { name: "Vue" /* 示例技能名称 */, desc: "组件开发" /* 示例技能描述 */ },
  { name: "TypeScript" /* 示例技能名称 */, desc: "类型设计" /* 示例技能描述 */ },
];
// 选择无评分、标签类、占比或圆环样式时显示技能条目编辑区。
const selectSkillTemplate = (value) => {
  skillTemplate.value = value;
  if (
    [
      "none",
      "tag",
      "notion",
      "rainbowTag",
      "distribution",
      "semiRing",
      "donut",
      "openRing",
    ].includes(value)
  )
    layout.value = "proficiency";
};
</script>

<template>
  <!-- 阻止布局入口的点击继续触发模块折叠。 -->
  <span class="flex items-center" @click.stop @mousedown.stop>
    <SfDropdown
      trigger="click"
      placement="bottom-start"
      :show-arrow="false"
      :hide-on-click="false"
    >
      <!-- 复用标题操作图标，并将点击交给下拉组件。 -->
      <SfTooltip :content="$t('skillLayout')">
        <Icon
          click-through
          icon="lucide:layout-template"
          :aria-label="$t('skillLayout')"
          aria-haspopup="menu"
        />
      </SfTooltip>
      <template #dropdown>
        <!-- 每项设置的说明与选项保持同一行。 -->
        <div
          class="flex w-[360px] max-w-[90vw] flex-col gap-3 rounded-3xl border border-sf-b bg-sf-primary whitespace-nowrap"
        >
          <div
            class="flex items-center justify-between gap-3 px-3 pt-3"
            :class="layout === 'proficiency' ? '' : 'pb-3'"
          >
            <p class="shrink-0 text-xs font-normal text-sf-text-2">
              {{ $t("skillLayout") }}
            </p>
            <ElRadioGroup
              v-model="layout"
              class="flex! flex-nowrap! items-center! gap-3!"
            >
              <ElRadio value="text" class="mr-0! whitespace-nowrap">{{
                $t("skillLayoutRichText")
              }}</ElRadio>
              <ElRadio value="proficiency" class="mr-0! whitespace-nowrap">{{
                $t("skillRating")
              }}</ElRadio>
            </ElRadioGroup>
          </div>
          <!-- 仅普通技能列表样式需要选择预览列数。 -->
          <div
            v-if="layout === 'proficiency' && skillTemplate !== 'distribution'"
            class="flex items-center justify-between gap-3 border-t border-sf-b px-3 pt-3"
          >
            <p class="shrink-0 text-xs font-normal text-sf-text-2">
              {{ $t("skillColumnHint") }}
            </p>
            <ElRadioGroup
              v-model="skillColumns"
              class="flex! flex-nowrap! items-center! gap-3!"
            >
              <ElRadio :value="1" class="mr-0! whitespace-nowrap">{{
                $t("skillSingleColumn")
              }}</ElRadio>
              <ElRadio :value="2" class="mr-0! whitespace-nowrap">{{
                $t("skillTwoColumns")
              }}</ElRadio>
              <ElRadio :value="3" class="mr-0! whitespace-nowrap">{{
                $t("skillThreeColumns")
              }}</ElRadio>
            </ElRadioGroup>
          </div>
          <!-- 富文本布局不显示技能模板选项。 -->
          <div
            v-if="layout === 'proficiency'"
            class="flex flex-col gap-3 border-t border-sf-b pt-3 pb-3"
          >
            <p class="px-3 text-xs font-normal text-sf-text-2">
              {{ $t("skillTemplate") }}
            </p>
            <!-- 模板选项直接使用项目滚动组件自带的左右内边距。 -->
            <SfScrollbar max-height="360px" class="w-full">
              <div class="grid grid-cols-2 gap-3">
                <div
                  v-for="option in skillTemplateList"
                  :key="option.value"
                  class="flex cursor-pointer flex-col items-center gap-3"
                  @click="selectSkillTemplate(option.value)"
                >
                  <!-- 描边卡片内只放伪数据技能行 -->
                  <div
                    class="flex w-full flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-3 border-sf-transparent bg-sf-bg p-3 text-center"
                    :class="{ 'border-sf-theme!': skillTemplate === option.value }"
                  >
                    <DistributionTemplate
                      v-if="option.value === 'distribution'"
                      :items="mockDistributionSkills"
                      sample
                    />
                    <ColorTags
                      v-else-if="
                        option.value === 'notion' || option.value === 'rainbowTag'
                      "
                      :items="mockNotionSkills"
                      :variant="option.value === 'notion' ? 'notion' : 'rainbowTag'"
                      sample
                    />
                    <!-- 标签示例只展示名称，沿用简历标签的圆角浅色样式。 -->
                    <span
                      v-else-if="option.value === 'tag'"
                      class="rounded-3xl bg-sf-theme-3 px-3 py-1 text-xs text-sf-theme"
                      >{{ mockSkill.name }}</span
                    >
                    <span
                      v-else-if="
                        !['semiRing', 'donut', 'openRing'].includes(option.value)
                      "
                      class="w-full text-center text-xs whitespace-normal text-sf-text-2"
                      >{{
                        option.value === "none"
                          ? `${mockSkill.name} ${mockSkill.desc}`
                          : mockSkill.name
                      }}</span
                    >
                    <SkillTemplate
                      v-if="
                        ![
                          'none',
                          'tag',
                          'notion',
                          'rainbowTag',
                          'distribution',
                        ].includes(option.value)
                      "
                      :template-id="option.value"
                      :level="mockSkill.level"
                      :name="$t('skillName')"
                      color="var(--sf-theme)"
                      :fluid="option.value === 'bar'"
                    />
                  </div>
                  <!-- 样式名放在描边卡片外，与模板选择排版一致 -->
                  <span
                    class="text-center text-xs"
                    :class="
                      skillTemplate === option.value
                        ? 'text-sf-theme'
                        : 'text-sf-text-2'
                    "
                    >{{ $t(option.labelKey) }}</span
                  >
                </div>
              </div>
            </SfScrollbar>
          </div>
        </div>
      </template>
    </SfDropdown>
  </span>
</template>

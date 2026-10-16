<script setup>
import { useResumeStore } from "@/stores";
import { useFormContext } from "@/components/business/dynamicForm/api";
import { jumpPreview } from "../../../../hooks/useModuleNav";
import { useScrollEditorTo } from "../../../../hooks/useScrollEditorTo";
import eventBus from "@/utils/modules/eventBus";
import { honorTemplateList, skillTemplateList } from "@/domain/resume/theme/uiConfig";
import {
  CUSTOM_MODULE_ICON,
  DEFAULT_MODULE_NAMES,
} from "@/stores/modules/resume/config/defaultConfig";
import SkillTemplate from "@/views/resume/theme/components/skillTemplate/index.vue";
import DistributionTemplate from "@/views/resume/theme/components/skillTemplate/distribution.vue";
import NotionTemplate from "@/views/resume/theme/components/skillTemplate/notion.vue";
import Icon from "../icon.vue";
import EditableTitle from "./editableTitle.vue";
import { $t } from "@/locales";
const { proxy } = getCurrentInstance();

const props = defineProps({
  add: {
    type: Boolean,
    default: true,
  },
  addWhenLayout: {
    type: String, // 指定显示新增入口时模块所需的布局值。
    default: "",
  },
  drag: {
    type: Boolean,
    default: true,
  },
  tip: {
    type: String,
    default: "",
  },
});
const title = defineModel("title", {
  type: String,
  default: "",
});
const { currentForm, addItem } = useFormContext();
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
// 荣誉布局保存在简历 ui.honor，标签布局只影响预览内容。
const honorLayout = computed({
  get: () => resumeStore.currentUI?.honor?.layout ?? "default",
  set: (value) => {
    resumeStore.currentUI.honor.layout = value;
  },
});
// 技能样式示例共用同一名称与十分制评分。
const mockSkill = {
  name: "Vue 是最好的语言", // 示例技能名称
  desc: "熟悉组件开发", // 示例技能描述
  level: 7, // 示例技能评分
};
// 荣誉模板的示例名称与描述共用同一组内容。
const mockHonor = {
  name: "国家奖学金", // 示例荣誉名称
  desc: "学习表现优秀", // 示例荣誉描述
  linkName: "获奖公告", // 示例荣誉链接名称
};
const mockHonorNameOnly = [{ name: mockHonor.name /* 标签与笔记风只展示荣誉名称 */ }];
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
  if (["none", "tag", "notion", "distribution", "semiRing", "donut", "openRing"].includes(value))
    layout.value = "proficiency";
};
// 仅在配置指定的布局下显示列表新增入口，正文布局保持原有编辑区。
const showAdd = computed(() => {
  if (!props.add) return false;
  if (!props.addWhenLayout) return true;
  return layout.value === props.addWhenLayout;
});
// 仅列表尚无记录时展示引导，新增首条记录后立即收起。
const showEmptyState = computed(
  () => showAdd.value && !resumeStore.currentData?.[currentForm.value?.key]?.list?.length,
);
const emptyModule = computed(() =>
  DEFAULT_MODULE_NAMES.find((module) => module.key === currentForm.value?.key),
);
const emptyStateKey = computed(() => emptyModule.value?.key ?? "custom");
// 展开状态：直接绑定激活项 name 数组（["1"] 展开 / [] 收起），随数据双向绑定
const collapsed = defineModel("collapsed", {
  type: Array,
  default: () => [],
});

// 隐藏状态：控制模块在简历预览中显示/隐藏
const hidden = defineModel("hidden", {
  type: Boolean,
  default: false,
});

function del() {
  proxy.$confirm($t("deleteModuleConfirm", { name: title.value }), $t("deleteConfirm")).then(() => {
    resumeStore.removeModule(currentForm.value.key);
  });
}

function toggleHidden() {
  resumeStore.setModuleHidden(currentForm.value.key, !hidden.value);
}

// 从编辑模块定位到预览区对应模块
function handlePreviewJump() {
  jumpPreview(currentForm.value.key);
}

function archiveModule() {
  proxy.$confirm($t("archiveMessage"), $t("archiveConfirm")).then(() => {
    resumeStore.setModuleArchived(currentForm.value.key, true);
  });
}

// 新增记录追加到列表末尾，同步定位编辑区与预览区
function locateAddedItem(index) {
  if (index == null) return;
  nextTick(() => {
    const moduleKey = currentForm.value?.key;
    useScrollEditorTo(
      document.querySelector(`[data-module-key="${moduleKey}"] [data-item-index="${index}"]`),
    );
    // 选中落到新增的那条记录，而不是整个模块
    eventBus.emit("df-select-module", { key: moduleKey, index });
    // 新增模块记录后定位预览区对应模块
    jumpPreview(moduleKey);
  });
}

function handleAdd() {
  // 新增一条子项：引擎内部深拷贝 itemSchema 后 push，避免多个子项共享同一份引用
  const index = addItem();
  locateAddedItem(index);
}
</script>

<template>
  <SfCollapse v-model="collapsed" :border="false" class="rounded-xl! bg-sf-primary!">
    <SfCollapseItem name="1" lazy class="resume-module-box">
      <template #title>
        <div class="group flex h-full w-full items-center justify-between">
          <div class="flex flex-1 items-center truncate text-lg font-bold">
            <Icon
              v-if="currentForm.key !== 'user'"
              icon="icon-park-outline:drag"
              class="container-drag cursor-move!"
            />
            <!-- 隐藏模块时为标题添加删除线标识 -->
            <EditableTitle v-model="title" :strike-through="hidden">
              <template v-if="currentForm.key === 'skill'" #actions>
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
                                  <NotionTemplate
                                    v-else-if="option.value === 'notion'"
                                    :items="mockNotionSkills"
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
                                      !['none', 'tag', 'notion', 'distribution'].includes(
                                        option.value,
                                      )
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
              <!-- 荣誉证书提供文本描述、标签、笔记风、清单和详情卡片布局。 -->
              <template v-else-if="currentForm.key === 'honor'" #actions>
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
                      <div class="flex w-[360px] max-w-[90vw] flex-col gap-3 rounded-3xl border border-sf-b bg-sf-primary p-3">
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
                              <NotionTemplate
                                v-if="option.value === 'notion'"
                                :items="mockHonorNameOnly"
                                sample
                              />
                              <template v-if="option.value === 'default'">
                                <span class="text-xs text-sf-text">{{ mockHonor.name }}</span>
                                <span class="text-xs text-sf-text-2">{{ mockHonor.desc }}</span>
                              </template>
                              <span v-else-if="option.value === 'tag'" class="rounded-3xl bg-sf-theme-3 px-3 py-[3px] text-xs text-sf-theme">{{ mockHonor.name }}</span>
                              <span v-else-if="option.value === 'list'" class="flex items-center gap-3 text-xs text-sf-text"><span class="text-sf-theme">•</span>{{ mockHonor.name }}</span>
                              <span v-else-if="option.value === 'card'" class="flex w-full flex-col gap-3 rounded-xl border border-sf-b bg-sf-primary p-3 text-left text-xs">
                                <span class="font-semibold text-sf-text">{{ mockHonor.name }}</span>
                                <span class="text-sf-text-2">{{ mockHonor.desc }}</span>
                                <span class="text-sf-theme">{{ mockHonor.linkName }}</span>
                              </span>
                            </div>
                            <span
                              class="text-center text-xs"
                              :class="honorLayout === option.value ? 'text-sf-theme' : 'text-sf-text-2'"
                            >{{ $t(option.labelKey) }}</span>
                          </div>
                        </div>
                      </div>
                    </template>
                  </SfDropdown>
                </span>
              </template>
            </EditableTitle>
          </div>
          <div class="flex items-center">
            <SfTooltip :content="$t('locatePreview')" v-if="!hidden">
              <Icon @click.stop="handlePreviewJump" icon="mdi:map-search-outline" />
            </SfTooltip>
            <SfTooltip :content="$t('archive')">
              <Icon @click.stop="archiveModule" icon="lucide:archive" size="4" />
            </SfTooltip>
            <SfTooltip :content="hidden ? $t('show') : $t('hide')">
              <Icon @click.stop="toggleHidden" :icon="hidden ? 'lucide:eye' : 'lucide:eye-off'" />
            </SfTooltip>
            <Icon
              v-if="currentForm.key !== 'user'"
              @click.stop="del"
              icon="ic:round-delete"
              size="4"
            />
          </div>
        </div>
      </template>
      <template #default>
        <div v-if="tip" class="mb-2">{{ tip }}</div>
        <div class="">
          <slot />
          <!-- 空态图标与文案居中排列，不使用背景底板。 -->
          <div
            v-if="showEmptyState"
            class="mx-3 mt-3 flex flex-col items-center gap-3 p-3 pb-0! text-center"
          >
            <SfIcon
              :icon="emptyModule?.icon ?? CUSTOM_MODULE_ICON"
              size="7"
              class="text-sf-text-2"
            />
            <p class="text-sm font-semibold text-sf-text">
              {{ $t(`resumeEmpty_${emptyStateKey}_title`) }}
            </p>
            <p class="text-xs leading-relaxed text-sf-text-2">
              {{ $t(`resumeEmpty_${emptyStateKey}_description`) }}
            </p>
          </div>
          <!-- 添加入口居中排列，悬停显示主题色虚线框，上下留白避免贴合分隔线。 -->
          <div class="px-3 py-3" v-if="showAdd">
            <button
              type="button"
              class="flex-c w-full cursor-pointer gap-3 rounded-3xl border border-dashed border-sf-b py-2 text-xs text-sf-text transition-colors hover:border-sf-theme hover:bg-sf-theme-3 hover:text-sf-theme"
              @click="handleAdd"
            >
              <SfIcon icon="ic:round-add" size="4" />
              <span>{{ $t("addRecord", { name: title }) }}</span>
            </button>
          </div>
        </div>
      </template>
    </SfCollapseItem>
  </SfCollapse>
</template>

<style scoped>
@reference "@/styles/tailwind.css";

/* 模块外框包裹头部与内容，统一圆角边界 */
.resume-module-box {
  @apply overflow-hidden rounded-xl border border-sf-b;
}
/* 折叠项经过组件转发，直接命中模块内容节点以清除默认下内边距。 */
:global(.resume-module-box .el-collapse-item__content) {
  padding-bottom: 0 !important;
}
/* 模块头部背景跟随明暗主题，并覆盖全局透明背景 */
.resume-module-box > :deep(.el-collapse-item__header) {
  @apply rounded-xl  px-3;
}

/* 展开时去掉头部下圆角，并在底边添加分隔线 */
.resume-module-box > :deep(.el-collapse-item__header.is-active) {
  @apply rounded-b-none border-b!  border-sf-b!;
}
</style>

<script setup>
import { useResumeStore } from "@/stores";
import { useFormContext } from "@/components/business/dynamicForm/api";
import { jumpPreview } from "../../../../hooks/useModuleNav";
import { useScrollEditorTo } from "../../../../hooks/useScrollEditorTo";
import eventBus from "@/utils/modules/eventBus";
import { skillTemplateList } from "@/domain/resume/theme/uiConfig";
import SkillTemplate from "@/views/resume/theme/components/skillTemplate/index.vue";
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
  get: () => resumeStore.currentUI?.skill?.layout ?? "text",
  set: (value) => { resumeStore.currentUI.skill.layout = value; },
});
const skillColumns = computed({
  get: () => resumeStore.currentUI?.skill?.columns ?? 1,
  set: (value) => { resumeStore.currentUI.skill.columns = value; },
});
const skillTemplate = computed({
  get: () => resumeStore.currentUI?.theme?.skillTemplate ?? "bar",
  set: (value) => { resumeStore.currentUI.theme.skillTemplate = value; },
});
// 样式示例沿用固定技能名称与满档熟练度。
const mockSkill = { name: "Vue 是最好的语言", level: 5 };
// 仅在配置指定的布局下显示列表新增入口，正文布局保持原有编辑区。
const showAdd = computed(() => {
  if (!props.add) return false;
  if (!props.addWhenLayout) return true;
  return layout.value === props.addWhenLayout;
});
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
                    <Icon
                      click-through
                      icon="lucide:layout-template"
                      :title="$t('skillLayout')"
                      :aria-label="$t('skillLayout')"
                      aria-haspopup="menu"
                    />
                    <template #dropdown>
                      <!-- 展示方式与列数分别成行，列数选项始终并排显示。 -->
                      <div
                        class="flex w-[360px] max-w-[90vw] flex-col gap-3 rounded-3xl border border-sf-b bg-sf-primary p-3 whitespace-nowrap"
                      >
                        <p class="text-xs font-normal text-sf-text-2">{{ $t("skillLayout") }}</p>
                        <ElRadioGroup
                          v-model="layout"
                          class="flex! flex-nowrap! items-center! justify-center! gap-3!"
                        >
                          <ElRadio value="text" class="mr-0! whitespace-nowrap">{{
                            $t("skillLayoutRichText")
                          }}</ElRadio>
                          <ElRadio value="proficiency" class="mr-0! whitespace-nowrap">{{
                            $t("proficiencyLevel")
                          }}</ElRadio>
                        </ElRadioGroup>
                        <!-- 仅熟练度布局需要选择预览列数。 -->
                        <div
                          v-if="layout === 'proficiency'"
                          class="flex flex-col gap-3 border-t border-sf-b pt-3"
                        >
                          <p class="text-xs font-normal text-sf-text-2">
                            {{ $t("skillColumnHint") }}
                          </p>
                          <ElRadioGroup
                            v-model="skillColumns"
                            class="flex! flex-nowrap! items-center! justify-center! gap-3!"
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
                        <!-- 技能模板示例与预览调用同一个组件。 -->
                        <div class="flex flex-col gap-3 border-t border-sf-b pt-3">
                          <p class="text-xs font-normal text-sf-text-2">{{ $t("skillTemplate") }}</p>
                          <div class="grid grid-cols-3 gap-3">
                            <div
                              v-for="option in skillTemplateList"
                              :key="option.value"
                              class="flex cursor-pointer flex-col items-center gap-3"
                              @click="skillTemplate = option.value"
                            >
                              <!-- 描边卡片内只放伪数据技能行 -->
                              <div
                                class="flex w-full flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-3 border-sf-transparent bg-sf-bg p-3 text-center"
                                :class="{ 'border-sf-theme!': skillTemplate === option.value }"
                              >
                                <span class="w-full text-center text-xs whitespace-normal text-sf-text-2">{{
                                  mockSkill.name
                                }}</span>
                                <SkillTemplate :template-id="option.value" :level="mockSkill.level" :color="resumeStore.currentUI?.theme?.color || '#50A2FF'" :fluid="option.value === 'bar'" />
                              </div>
                              <!-- 样式名放在描边卡片外，与模板选择排版一致 -->
                              <span
                                class="text-center text-xs"
                                :class="
                                  skillTemplate === option.value ? 'text-sf-theme' : 'text-sf-text-2'
                                "
                                >{{ $t(option.labelKey) }}</span
                              >
                            </div>
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
/* 所有模块外层统一取消折叠内容区默认的底部留白 */
.resume-module-box > :deep(.el-collapse-item__wrap > .el-collapse-item__content) {
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

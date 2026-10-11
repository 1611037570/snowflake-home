<script setup>
import { $t } from "@/locales";
import { EXPANDED } from "@/stores/modules/resume/config/formConfig";
import { useFormContext } from "@/components/business/dynamicForm/api";
import Icon from "../icon.vue";
import { useResumeStore } from "@/stores";
import { cloneDeep } from "lodash-es";

const { proxy } = getCurrentInstance();
// 记录折叠状态：复用展开常量，随记录数据持久化
const collapsed = defineModel("collapsed", {
  type: Array,
  default: () => EXPANDED,
});
const name = defineModel("name", {
  type: String,
  default: "",
});
// 当前经历项的隐藏状态
const hidden = defineModel("hidden", {
  type: Boolean,
  default: false,
});
const { removeCurrent } = useFormContext();
const resumeStore = useResumeStore();

// 标题：统一走 name 数据源，空值占位符兜底
const displayTitle = computed(() => name.value || $t("notFilled"));

function del() {
  proxy.$confirm($t("deleteItemMessage", { name: name.value }), $t("deleteConfirm")).then(() => {
    removeCurrent();
  });
}

// 按当前记录位置复制完整数据，副本紧接原记录且不共享嵌套引用。
function copyItem(event) {
  const target = event.target;
  const moduleKey = target.closest("[data-module-key]")?.dataset.moduleKey;
  const itemIndex = target.closest("[data-item-index]")?.dataset.itemIndex;
  if (!moduleKey || itemIndex == null) return;
  const index = Number(itemIndex);
  const records = resumeStore.currentData?.[moduleKey]?.list;
  if (!Array.isArray(records) || !Number.isInteger(index) || index < 0 || !records[index]) return;
  records.splice(index + 1, 0, cloneDeep(records[index]));
}
</script>

<template>
  <SfCollapse v-model="collapsed" :border="false">
    <SfCollapseItem name="1" lazy class="resume-record-box">
      <template #title>
        <div class="group flex h-full w-full items-center justify-between text-sf-text">
          <!-- 子记录标题适度加重，操作图标保留清晰度并区分层级。 -->
          <div class="flex min-w-0 flex-1 items-center text-[15px] font-semibold">
            <Icon
              icon="icon-park-outline:drag"
              class="item-drag shrink-0 cursor-move! text-sf-text-2 hover:text-sf-text"
            />
            <!-- 隐藏状态通过名称删除线表达，操作图标保持统一颜色。 -->
            <span class="truncate" :class="{ 'line-through': hidden }">{{ displayTitle }}</span>
          </div>
          <div class="flex shrink-0 items-center text-sf-text-2">
            <SfTooltip :content="$t('copyRecord')">
              <Icon @click.stop="copyItem" icon="ph:copy-duotone" class="hover:text-sf-text" />
            </SfTooltip>
            <SfTooltip :content="hidden ? $t('show') : $t('hide')">
              <Icon
                :icon="hidden ? 'lucide:eye' : 'lucide:eye-off'"
                @click.stop="hidden = !hidden"
                class="hover:text-sf-text"
              />
            </SfTooltip>

            <Icon @click.stop="del" icon="ic:round-delete" class="hover:text-sf-error" />
          </div>
        </div>
      </template>
      <template #default>
        <slot />
      </template>
    </SfCollapseItem>
  </SfCollapse>
</template>

<style lang="scss" scoped>
@reference "@/styles/tailwind.css";

/* 标题底色覆盖整条记录，展开时明确正文的所属范围。 */
.resume-record-box > :deep(.el-collapse-item__header) {
  @apply -mx-3 px-3;
}
.resume-record-box > :deep(.el-collapse-item__header.is-active) {
  @apply bg-sf-bg;
}
/* 折叠箭头与操作图标保持同级颜色，取消正文默认底部留白。 */
.resume-record-box > :deep(.el-collapse-item__header .el-collapse-item__arrow) {
  @apply text-sf-text-2;
}
.resume-record-box > :deep(.el-collapse-item__wrap > .el-collapse-item__content) {
  padding-bottom: 0;
}
</style>

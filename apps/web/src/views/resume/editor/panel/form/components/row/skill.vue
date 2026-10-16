<script setup>
import { $t } from "@/locales";
import { getCurrentInstance } from "vue";
import { useFormContext } from "@/components/business/dynamicForm/api";
import { EXPANDED } from "@/stores/modules/resume/config/formConfig";
import Icon from "../icon.vue";

const { proxy } = getCurrentInstance();

// 每条技能独立保存折叠状态。
const collapsed = defineModel("collapsed", { type: Array, default: () => EXPANDED });
// 技能名称数据
const name = defineModel("name", {
  type: String,
  default: "",
});
// 技能描述与名称一同编辑。
const desc = defineModel("desc", { type: String, default: "" });
// 所有技能样式共用一个一到十分的滑块数值。
const level = defineModel("level", { type: Number, default: 7 });
// 十分制评分每两分对应一个熟练度档位，随滑杆实时显示。
const proficiencyKeys = [
  "proficiencyBeginner",
  "proficiencyFamiliar",
  "proficiencySkilled",
  "proficiencyExpert",
  "proficiencyMaster",
];
const proficiencyLabel = computed(() => $t("proficiencyLevelWithLabel", {
  label: $t(proficiencyKeys[Math.ceil(level.value / 2) - 1]),
}));
// 当前技能的隐藏状态
const hidden = defineModel("hidden", {
  type: Boolean,
  default: false,
});
const { removeCurrent } = useFormContext();

// 删除当前技能
const removeSkill = () => {
  proxy.$confirm($t("deleteCurrentContent"), $t("deleteConfirm")).then(() => {
    removeCurrent();
  });
};
</script>

<template>
  <SfCollapse v-model="collapsed" :border="false">
    <SfCollapseItem name="1" lazy>
      <template #title>
        <!-- 标题和操作按钮始终可见，字段随条目独立折叠。 -->
        <div class="flex w-full items-center gap-3">
          <SfIcon icon="icon-park-outline:drag" size="4" class="item-drag cursor-move!" @click.stop="" />
          <span class="min-w-0 flex-1 truncate font-medium">{{ name || $t('notFilled') }}</span>
          <SfTooltip :content="hidden ? $t('show') : $t('hide')">
            <Icon
              :icon="hidden ? 'lucide:eye' : 'lucide:eye-off'"
              @click.stop="hidden = !hidden"
              :class="hidden ? 'text-sf-theme' : ''"
            />
          </SfTooltip>
          <Icon icon="ic:round-delete" @click.stop="removeSkill" />
        </div>
      </template>
      <div class="flex w-full flex-col gap-3 pb-3">
        <!-- 技能名称和熟练度各占十二栅格，描述独占整行。 -->
        <div class="grid grid-cols-2 gap-3">
          <SfFormItem :label="$t('skillName')">
            <SfInput v-model="name" clearable :placeholder="$t('skillNamePlaceholder')" />
          </SfFormItem>
          <SfFormItem :label="proficiencyLabel">
            <SfSlider v-model="level" :min="1" :max="10" :step="1" size="small" />
          </SfFormItem>
        </div>
        <!-- 技能描述默认一行，内容增加时自动扩展。 -->
        <SfFormItem :label="$t('skillDescription')">
          <SfInput
            v-model="desc"
            type="textarea"
            clearable
            :autosize="{ minRows: 1 }"
            :placeholder="$t('skillDescriptionPlaceholder')"
          />
        </SfFormItem>
      </div>
    </SfCollapseItem>
  </SfCollapse>
</template>

<style lang="scss" scoped></style>

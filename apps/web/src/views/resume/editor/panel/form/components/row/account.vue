<script setup>
import { $t } from "@/locales";
import { getCurrentInstance } from "vue";
import { useFormContext } from "@/components/business/dynamicForm/api";
import Icon from "../icon.vue";
import UrlInput from "../field/urlInput.vue";

const { proxy } = getCurrentInstance();

// 社交账号列表数据
const name = defineModel("name", {
  type: String,
  default: "",
});
const url = defineModel("url", {
  type: String,
  default: "",
});
// 当前社交账号的隐藏状态
const hidden = defineModel("hidden", {
  type: Boolean,
  default: false,
});
const { removeCurrent } = useFormContext();

// 删除社交账号
const removeAccount = () => {
  proxy.$confirm($t("deleteCurrentContent"), $t("deleteConfirm")).then(() => {
    removeCurrent();
  });
};
</script>

<template>
  <div class="flex w-full items-center gap-1">
    <Icon icon="icon-park-outline:drag" class="item-drag cursor-move!" />
    <!-- 平台名称支持直接清除。 -->
    <div class="mr-1 w-22 min-w-0">
      <SfInput v-model="name" :placeholder="$t('platform')" clearable />
    </div>
    <!-- 第二个是网址 -->
    <div class="min-w-0 flex-1">
      <UrlInput v-model="url" :placeholder="$t('website')" />
    </div>
    <!-- 隐藏当前社交账号 -->

    <SfTooltip :content="hidden ? $t('show') : $t('hide')">
      <Icon
        :icon="hidden ? 'lucide:eye' : 'lucide:eye-off'"
        @click.stop="hidden = !hidden"
        :class="hidden ? 'text-sf-theme' : ''"
      />
    </SfTooltip>
    <!-- 删除按钮 -->
    <Icon icon="ic:round-delete" @click="removeAccount" />
  </div>
</template>

<style lang="scss" scoped></style>

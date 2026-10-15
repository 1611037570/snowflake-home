<script setup lang="ts">
import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import {
  NO_SELF_AUTHOR,
  isPublicationCoFirstAuthor,
  isPublicationCorrespondingAuthor,
  isPublicationSelfAuthor,
  plainPublicationAuthorName,
  publicationAuthorMarks,
  splitPublicationAuthors,
} from "@/domain/resume/publicationAuthors";

const authors = defineModel<string>("modelValue", { default: "" });
const selfAuthor = defineModel<string>("selfAuthor");
const { currentData } = storeToRefs(useResumeStore());

// 作者候选与简历预览使用同一套分隔及姓名匹配规则。
const authorNames = computed(() => splitPublicationAuthors(authors.value));
const savedName = computed(() => String(currentData.value?.user?.data?.name || "").trim());
const selectedName = computed(() =>
  !selfAuthor.value ? savedName.value : selfAuthor.value === NO_SELF_AUTHOR ? "" : selfAuthor.value,
);
const isAutomatic = computed(() => !selfAuthor.value);

// 作者全部删空时同时清除选择，避免标记让空白论文进入预览。
watch(
  authorNames,
  (names) => {
    if (!names.length && selfAuthor.value) selfAuthor.value = "";
  },
  { immediate: true },
);

const isSelected = (name: string) =>
  isPublicationSelfAuthor(name, selfAuthor.value, savedName.value);
const selectAuthor = (name: string) => {
  selfAuthor.value = plainPublicationAuthorName(name);
};
const clearSelection = () => {
  selfAuthor.value = NO_SELF_AUTHOR;
};
// 右侧入口允许手动选择或清除后恢复姓名自动识别。
const selectAutomatic = () => {
  selfAuthor.value = "";
};
</script>

<template>
  <!-- 作者输入及选择区统一使用十四像素字号。 -->
  <section class="flex w-full flex-col gap-1 text-sm">
    <!-- 多行输入默认显示一行，输入后自动增高。 -->
    <SfInput
      v-model="authors"
      type="textarea"
      :autosize="{ minRows: 1, maxRows: 4 }"
      :placeholder="$t('publicationAuthorsPlaceholder')"
      class="[&_.el-textarea__inner]:text-sm"
    />
    <!-- 分隔说明在左侧，两个操作按钮并列放在右侧。 -->
    <div class="flex items-center gap-1">
      <p class="min-w-0 flex-1 text-sm leading-relaxed text-sf-text-3">
        {{ $t("publicationAuthorsHelp") }}
      </p>
      <button
        type="button"
        class="shrink-0 text-sm text-sf-text-3 underline-offset-2 hover:text-sf-theme hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!selectedName || !authorNames.length"
        @click="clearSelection"
      >
        {{ $t("publicationClearEmphasis") }}
      </button>
      <button
        type="button"
        class="flex-c h-6 shrink-0 cursor-pointer rounded-3xl border px-3 text-sm transition-colors"
        :class="
          isAutomatic
            ? 'border-sf-theme bg-sf-theme-3 text-sf-theme'
            : 'border-sf-b text-sf-text-2 hover:border-sf-theme hover:text-sf-theme'
        "
        :aria-pressed="isAutomatic"
        @click="selectAutomatic"
      >
        {{ $t("publicationAutoSelf") }}
      </button>
    </div>
    <p v-if="!authorNames.length" class="text-sm text-sf-text-3">
      {{ $t("publicationSelectHint") }}
    </p>
    <div v-else class="flex flex-wrap gap-1">
      <button
        v-for="(name, index) in authorNames"
        :key="`${name}-${index}`"
        type="button"
        class="flex-c h-6 cursor-pointer rounded-3xl border px-3 text-sm transition-colors"
        :class="
          isSelected(name)
            ? 'border-sf-theme bg-sf-theme-3 text-sf-theme'
            : 'border-sf-b text-sf-text-2 hover:border-sf-theme hover:text-sf-theme'
        "
        :aria-pressed="isSelected(name)"
        :aria-label="$t('publicationSelectAuthor', { name })"
        :title="[
          isPublicationCorrespondingAuthor(name) ? $t('publicationOrderCorresponding') : '',
          isPublicationCoFirstAuthor(name) ? $t('publicationOrderCoFirst') : '',
        ].filter(Boolean).join('、') || undefined"
        @click="selectAuthor(name)"
      >
        <span
          >{{ plainPublicationAuthorName(name)
          }}<sup v-if="publicationAuthorMarks(name)">{{ publicationAuthorMarks(name) }}</sup></span
        >
      </button>
    </div>
  </section>
</template>
